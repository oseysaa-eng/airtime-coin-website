import mongoose from "mongoose";

import Wallet from "../models/Wallet";
import Transaction from "../models/Transaction";
import RewardPool from "../models/RewardPool";

import { resetIfNewDay } from "../utils/resetDailyCounter";
import { getEmissionMultiplier } from "./emissionService";
import { checkEarningLimits } from "../utils/earningGuard";

import { pushWalletUpdate, pushMinutes } from "../sockets/socket";

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

  try {
    const userIdStr = userId.toString();

    /* ================= HARD CAP ================= */
    const limit = await checkEarningLimits(userId, minutes, source);
    if (!limit.allowed) {
      throw new Error(limit.reason);
    }

    /* ================= EMISSION ================= */
    const emissionMultiplier = await getEmissionMultiplier();

    let finalMinutes = minutes;
    let finalATC = Number(
      (minutes * BASE_RATE * emissionMultiplier).toFixed(6)
    );

    if (finalATC <= 0) {
      throw new Error("Emission too low");
    }

    /* ================= POOL ================= */
    const pool = await RewardPool.findOne({ type: source }).session(session);

    if (!pool) throw new Error(`Pool not found: ${source}`);
    if (pool.paused) throw new Error(`${source} paused`);

    resetIfNewDay(pool);

    if (pool.balanceATC < finalATC) {
      // 🔥 SCALE DOWN
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
        },
      },
      { new: true, upsert: true, session }
    );

    /* ================= DAILY LIMIT ================= */
    const DAILY_CAP = 200;
    const remaining = DAILY_CAP - wallet.todayMinutes;

    if (remaining <= 0) {
      await session.commitTransaction();
      session.endSession();

      return {
        creditedMinutes: 0,
        creditedATC: 0,
      };
    }

    finalMinutes = Math.min(finalMinutes, remaining);

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
            ...meta,
          },
        },
      ],
      { session }
    );

    /* ================= COMMIT ================= */
    await session.commitTransaction();
    session.endSession();

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