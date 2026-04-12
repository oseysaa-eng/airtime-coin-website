import RewardPool from "../models/RewardPool";

export const ensurePools = async () => {
  const types = ["ADS", "CALL_SESSION", "SURVEY", "DAILY_BONUS"];

  for (const type of types) {
    const exists = await RewardPool.findOne({ type });

    if (!exists) {
      await RewardPool.create({
        type,
        balanceATC: 100000,
        dailyLimitATC: 5000,
        spentTodayATC: 0,
        paused: false,
        lastReset: new Date(),
      });

      console.log(`✅ Pool created: ${type}`);
    }
  }
};