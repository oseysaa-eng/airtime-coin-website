import RewardPool from "../models/RewardPool";

export async function resetPoolsDaily() {
  await RewardPool.updateMany(
    {},
    { $set: { spentTodayATC: 0 } }
  );
}
