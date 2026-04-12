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

let finalMinutes = minutes;
let finalATC = Number(
  (minutes * BASE_RATE * emissionMultiplier).toFixed(6)
);

if (finalATC <= 0) {
  throw new Error("Emission too low");
}

/* ================= POOL ================= */
const pool = await RewardPool.findOne({ type: source }).session(session);

if (!pool) throw new Error(`Reward pool not found: ${source}`);
if (pool.paused) throw new Error(`${source} rewards paused`);

if (pool.balanceATC < 1) {
  console.warn("⚠️ Pool drained — emergency refill");

  pool.balanceATC += 200000;
  pool.paused = false;

  await pool.save({ session });
}

resetIfNewDay(pool);

/* 🔥 SCALING FIX */
if (pool.balanceATC < finalATC) {
  console.warn("⚠️ Pool low — scaling reward");

  const scaledATC = pool.balanceATC * 0.9;

  finalMinutes = Math.floor(
    scaledATC / (BASE_RATE * emissionMultiplier)
  );

  if (finalMinutes <= 0) {
  console.warn("⚠️ Pool critically empty — auto refill");

  pool.balanceATC += 100000; // 🔥 refill instantly
  pool.paused = false;

  await pool.save({ session });

  finalMinutes = 1; // minimum reward
  finalATC = Number(
    (finalMinutes * BASE_RATE * emissionMultiplier).toFixed(6)
  );
}
}

/* ================= WALLET ================= */
let wallet = await Wallet.findOneAndUpdate(
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

/* ================= APPLY ================= */

finalATC = Number(
  (finalMinutes * BASE_RATE * emissionMultiplier).toFixed(6)
);

// 🔒 ATOMIC POOL UPDATE
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
  throw new Error("Pool depleted (atomic)");
}

// Wallet
wallet.totalMinutes += finalMinutes;
wallet.todayMinutes += finalMinutes;

await wallet.save({ session });

// TX
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

// ✅ COMMIT (CRITICAL FIX)
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