import connectDB from "../config/db";
import RewardPool from "../models/RewardPool";

async function run() {
  await connectDB();

  const pools = ["CALL", "ADS", "SURVEY"];

  for (const type of pools) {
    await RewardPool.updateOne(
      { type },
      {
        $setOnInsert: {
          balanceATC: 0,
          dailyLimitATC: 500, // example
          spentTodayATC: 0,
          paused: false,
        },
      },
      { upsert: true }
    );
  }

  console.log("✅ Reward pools initialized");
  process.exit();
}

run();
