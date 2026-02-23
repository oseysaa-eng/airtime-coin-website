import RewardPool from "../models/RewardPool";
import Transaction from "../models/Transaction";
import Wallet from "../models/Wallet";
import { resetIfNewDay } from "../utils/resetDailyCounter";
import { getEmissionMultiplier } from "./emissionService";

const BASE_RATE = 0.0025;

export async function creditReward({
  userId,
  source,
  minutes,
  meta,
}: {
  userId: string;
  source: "CALL" | "ADS" | "SURVEY";
  minutes: number;
  meta?: any;
}) {
  if (minutes <= 0) {
    throw new Error("Invalid minutes");
  }


  
  const emissionMultiplier = await getEmissionMultiplier();
  const atcAmount = Number(
    (minutes * BASE_RATE * emissionMultiplier).toFixed(6)
  );

  if (atcAmount <= 0) {
    throw new Error("Emission too low");
  }

  const pool = await RewardPool.findOne({ type: source });
  if (!pool) throw new Error(`Reward pool not found: ${source}`);

  if (pool.paused) {
    throw new Error(`${source} rewards are paused`);
  }

  resetIfNewDay(pool);

  if (pool.balanceATC < atcAmount) {
    throw new Error("Reward pool depleted");
  }

  if (pool.spentTodayATC + atcAmount > pool.dailyLimitATC) {
    throw new Error("Daily reward limit reached");
  }

  if (pool.balanceATC < pool.dailyLimitATC * 2) {
  pool.paused = true;
}
  const wallet =
    (await Wallet.findOne({ userId })) ||
    (await Wallet.create({ userId }));

  // Apply changes
  pool.balanceATC -= atcAmount;
  pool.spentTodayATC += atcAmount;
  await pool.save();
  

  wallet.balanceATC += atcAmount;
  await wallet.save();

  await Transaction.create({
    userId,
    type: "EARN",
    source,
    amount: atcAmount,
    meta,
  });

  return {
    creditedMinutes: minutes,
    creditedATC: atcAmount,
    emissionMultiplier,
    poolRemainingATC: pool.balanceATC,
  };
}
