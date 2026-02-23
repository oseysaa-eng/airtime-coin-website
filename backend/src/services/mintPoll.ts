import RewardPool from "../models/RewardPool";

export async function mintToPool(
  poolType: "CALL" | "ADS" | "SURVEY",
  amountATC: number
) {
  const pool = await RewardPool.findOne({ type: poolType });
  if (!pool) throw new Error("Pool not found");

  pool.balanceATC += amountATC;
  await pool.save();
}
