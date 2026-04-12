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
    const userIdStr = userId.toString(); // 🔥 IMPORTANT FIX

    /* ================= EMISSION ================= */
    const emissionMultiplier = await getEmissionMultiplier();

    const atcAmount = Number(
      (minutes * BASE_RATE * emissionMultiplier).toFixed(6)
    );

    if (atcAmount <= 0) {
      throw new Error("Emission too low");
    }

    /* ================= POOL ================= */
    const pool = await RewardPool.findOne({ type: source }).session(session);

    if (!pool) throw new Error(`Reward pool not found: ${source}`);
    if (pool.paused) throw new Error(`${source} rewards paused`);

    resetIfNewDay(pool);

    if (pool.balanceATC < atcAmount) throw new Error("Pool depleted");
    if (pool.spentTodayATC + atcAmount > pool.dailyLimitATC)
      throw new Error("Daily limit reached");

    /* ================= WALLET ================= */
    let wallet = await Wallet.findOne({ userId }).session(session);

    if (!wallet) {
      wallet = await Wallet.create(
        [
          {
            userId,
            balanceATC: 0,
            totalMinutes: 0,
            todayMinutes: 0,
          },
        ],
        { session }
      ).then((res) => res[0]);
    }

    /* ================= APPLY ================= */

    pool.balanceATC -= atcAmount;
    pool.spentTodayATC += atcAmount;

    if (pool.balanceATC < pool.dailyLimitATC * 2) {
      pool.paused = true;
    }

    await pool.save({ session });

    wallet.balanceATC += atcAmount;
    wallet.totalMinutes += minutes;
    wallet.todayMinutes += minutes;

    await wallet.save({ session });

    /* ================= TX ================= */
    await Transaction.create(
      [
        {
          userId,
          type: "EARN",
          source,
          amount: atcAmount,
          meta: {
            minutes,
            emissionMultiplier,
            ...meta,
          },
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    /* ================= REAL-TIME ================= */

    console.log("📤 Emitting wallet update →", userIdStr);

    pushWalletUpdate(userIdStr, {
      balance: wallet.balanceATC,
      totalMinutes: wallet.totalMinutes,
      todayMinutes: wallet.todayMinutes,
      minutes, // 🔥 IMPORTANT (frontend expects this)
      source,
    });

    pushMinutes(userIdStr, minutes, { source });

    return {
      creditedMinutes: minutes,
      creditedATC: atcAmount,
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