import mongoose from "mongoose";

import Wallet from "../models/Wallet";
import Transaction from "../models/Transaction";
import RewardPool from "../models/RewardPool";

import { resetIfNewDay } from "../utils/resetDailyCounter";
import { getEmissionMultiplier } from "./emissionService";

import {
  pushWalletUpdate,
  pushMinutes,
} from "../sockets/socket";

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

    /* ================= EMISSION (FOR POOL ONLY) ================= */
    const emissionMultiplier = await getEmissionMultiplier();

    let finalMinutes = minutes;

    let requiredATC = Number(
      (finalMinutes * BASE_RATE * emissionMultiplier).toFixed(6)
    );

    if (requiredATC <= 0) {
      throw new Error("Emission too low");
    }

    /* ================= POOL ================= */
    const pool = await RewardPool.findOne({ type: source }).session(session);

    if (!pool) throw new Error(`Reward pool not found: ${source}`);
    if (pool.paused) throw new Error(`${source} rewards paused`);

    resetIfNewDay(pool);

    /* 🔥 AUTO REFILL IF EMPTY */
    if (pool.balanceATC < 1) {
      console.warn("⚠️ Pool drained — emergency refill");

      pool.balanceATC += 200000;
      pool.paused = false;

      await pool.save({ session });
    }

    /* 🔥 SCALE REWARD IF LOW */
    if (pool.balanceATC < requiredATC) {
      console.warn("⚠️ Pool low — scaling reward");

      const scaledATC = pool.balanceATC * 0.9;

      finalMinutes = Math.floor(
        scaledATC / (BASE_RATE * emissionMultiplier)
      );

      if (finalMinutes <= 0) {
        console.warn("⚠️ Critical — forcing minimum reward");

        finalMinutes = 1;
      }

      requiredATC = Number(
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
        },
      },
      {
        new: true,
        upsert: true,
        session,
      }
    );

    /* ================= ATOMIC POOL UPDATE ================= */
    const updatedPool = await RewardPool.findOneAndUpdate(
      {
        _id: pool._id,
        balanceATC: { $gte: requiredATC },
      },
      {
        $inc: {
          balanceATC: -requiredATC,
          spentTodayATC: requiredATC,
        },
      },
      { new: true, session }
    );

    if (!updatedPool) {
      throw new Error("Pool depleted (atomic)");
    }

    /* ================= APPLY (MINUTES ONLY) ================= */

    wallet.totalMinutes += finalMinutes;
    wallet.todayMinutes += finalMinutes;

    await wallet.save({ session });

    /* ================= TRANSACTION ================= */
    await Transaction.create(
      [
        {
          userId,
          type: "EARN_MINUTES", // ✅ FIXED
          source,
          amount: finalMinutes, // ✅ MINUTES ONLY
          meta: {
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

    /* ================= REAL-TIME ================= */

    pushWalletUpdate(userIdStr, {
      totalMinutes: wallet.totalMinutes,
      todayMinutes: wallet.todayMinutes,
      minutes: finalMinutes,
      source,
    });

    pushMinutes(userIdStr, finalMinutes, { source });

    return {
      creditedMinutes: finalMinutes,
    };

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("❌ REWARD ENGINE ERROR:", err);
    throw err;
  }
}