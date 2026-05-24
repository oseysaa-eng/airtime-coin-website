import Transaction from "../models/Transaction";
import Wallet from "../models/Wallet";
import Streak from "../models/Streak";
import { STREAK_REWARDS } from "../config/streakRewards";

export const processStreakRewards = async (
  userId: string
) => {

  // ALWAYS fetch fresh streak
  const streak = await Streak.findOne({ userId });

  if (!streak) return null;

  const current = streak.current || 0;

  const reward = STREAK_REWARDS.find(
    (r) =>
      r.days === current &&
      !streak.rewardsClaimed.includes(r.days)
  );

  if (!reward) return streak;

  // MARK CLAIMED FIRST
  streak.rewardsClaimed.push(reward.days);

  await streak.save();

  // NOW reward safely
  await Wallet.updateOne(
    { userId },
    { $inc: { balanceATC: reward.reward } }
  );

  await Transaction.create({
    userId,
    type: "BONUS",
    amount: reward.reward,
    source: "STREAK_REWARD",
    meta: {
      streakDays: reward.days,
    },
  });

  streak._rewardAdded = reward.reward;

  return streak;
};