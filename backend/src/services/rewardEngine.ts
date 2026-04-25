import mongoose from "mongoose";

import Wallet from "../models/Wallet";
import Transaction from "../models/Transaction";
import RewardPool from "../models/RewardPool";
import UserTrust from "../models/UserTrust";
import SystemSettings from "../models/SystemSettings";

import { resetIfNewDay } from "../utils/resetDailyCounter";
import { getEmissionMultiplier } from "./emissionService";
import { checkEarningLimits } from "../utils/earningGuard";

import { pushWalletUpdate, pushMinutes } from "../sockets/socket";
import { applyTrustPenalty } from "./trustEngine";
import {
  detectAbnormalEarning,
  detectRapidActions,
} from "../utils/fraudSignals";

const BASE_RATE = 0.0025;

export async function rewardEngine({
  userId,
  minutes,
  source,
  meta = {},
}: {
  userId: string;
  minutes: number;
  source: "CALL_SESSION" | "ADS" | "SURVEY" | "DAILY_BONUS";
  meta?: any;
}) {
  if (!minutes || minutes <= 0) {
    throw new Error("Invalid minutes");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  let fraudFlags: string[] = [];

  try {
    const userIdStr = userId.toString();

    /* ================= HARD CAP ================= */
    const limit = await checkEarningLimits(userId, minutes, source);
    if (!limit.allowed) {
      throw new Error(limit.reason);
    }

    /* ================= FRAUD DETECTION (COLLECT ONLY) ================= */
    if (await detectAbnormalEarning(userId, minutes)) {
      fraudFlags.push("ABNORMAL_EARNING");
    }

    if (await detectRapidActions(userId)) {
      fraudFlags.push("RAPID_ACTIONS");
    }

    /* ================= EMISSION ================= */
    const emissionMultiplier = await getEmissionMultiplier();

    let finalMinutes = minutes;

    /* ================= TRUST ================= */
    const trust = await UserTrust.findOne({ userId }).session(session);

    let trustMultiplier = 1;

    if (trust) {
      if (trust.score < 80) trustMultiplier = 0.8;
      if (trust.score < 60) trustMultiplier = 0.5;
      if (trust.score < 40) {
        throw new Error("User blocked (low trust)");
      }
    }

    finalMinutes = Math.floor(finalMinutes * trustMultiplier);

    let finalATC = Number(
      (finalMinutes * BASE_RATE * emissionMultiplier).toFixed(6)
    );

    if (finalATC <= 0) {
      throw new Error("Emission too low");
    }

    /* ================= SETTINGS ================= */
    const settings = await SystemSettings.findOne().session(session);
    const DAILY_CAP =
      settings?.beta?.dailyMinutesCap || 200;

    /* ================= POOL ================= */
    const pool = await RewardPool.findOne({ type: source }).session(session);

    if (!pool) throw new Error(`Pool not found: ${source}`);
    if (pool.paused) throw new Error(`${source} paused`);

    resetIfNewDay(pool);

    if (pool.balanceATC < finalATC) {
      const scaledATC = pool.balanceATC * 0.9;

      finalMinutes = Math.floor(
        scaledATC / (BASE_RATE * emissionMultiplier)
      );

      if (finalMinutes <= 0) {
        throw new Error("Pool empty");
      }

      finalATC = Number(
        (finalMinutes * BASE_RATE * emissionMultiplier).toFixed(6)
      );
    }

    /* ================= WALLET ================= */
    const wallet = await Wallet.findOneAndUpdate(
      { userId },
      {
        $setOnInsert: {
          userId,
          balanceATC: 0,
          totalMinutes: 0,
          todayMinutes: 0,
          lastHourMinutes: 0,
          lastHourReset: new Date(),
        },
      },
      { new: true, upsert: true, session }
    );

    /* ================= HOURLY RESET ================= */
    const now = new Date();
    const lastHour = new Date(wallet.lastHourReset || now);

    if (now.getHours() !== lastHour.getHours()) {
      wallet.lastHourMinutes = 0;
      wallet.lastHourReset = now;
    }

    /* ================= DAILY LIMIT ================= */
    const remaining = DAILY_CAP - wallet.todayMinutes;

    if (remaining <= 0) {
      await session.commitTransaction();
      session.endSession();

      return { creditedMinutes: 0, creditedATC: 0 };
    }

    finalMinutes = Math.min(finalMinutes, remaining);

    if (finalMinutes <= 0) {
      await session.commitTransaction();
      session.endSession();

      return { creditedMinutes: 0, creditedATC: 0 };
    }

    finalATC = Number(
      (finalMinutes * BASE_RATE * emissionMultiplier).toFixed(6)
    );

    /* ================= POOL UPDATE ================= */
    const updatedPool = await RewardPool.findOneAndUpdate(
      {
        _id: pool._id,
        balanceATC: { $gte: finalATC },
      },
      {
        $inc: {
          balanceATC: -finalATC,
          spentTodayATC: finalATC,
        },
      },
      { new: true, session }
    );

    if (!updatedPool) {
      throw new Error("Pool depleted");
    }

    /* ================= WALLET UPDATE ================= */
    wallet.totalMinutes += finalMinutes;
    wallet.todayMinutes += finalMinutes;
    wallet.lastHourMinutes += finalMinutes;
    wallet.balanceATC += finalATC;

    await wallet.save({ session });

    /* ================= TRANSACTION ================= */
    await Transaction.create(
      [
        {
          userId,
          type: "EARN",
          source,
          amount: finalATC,
          meta: {
            minutes: finalMinutes,
            emissionMultiplier,
            trustMultiplier,
            ...meta,
          },
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    /* ================= APPLY FRAUD PENALTIES (AFTER COMMIT) ================= */
    for (const flag of fraudFlags) {
      await applyTrustPenalty({
        userId,
        type: flag as any,
      });
    }

    /* ================= SOCKET ================= */
    pushWalletUpdate(userIdStr, {
      totalMinutes: wallet.totalMinutes,
      todayMinutes: wallet.todayMinutes,
      minutes: finalMinutes,
      source,
    });

    pushMinutes(userIdStr, finalMinutes, { source });

    return {
      creditedMinutes: finalMinutes,
      creditedATC: finalATC,
      emissionMultiplier,
      balance: wallet.balanceATC,
    };

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("❌ REWARD ENGINE ERROR:", err);
    throw err;
  }
}