import Transaction from "../models/Transaction";
import Wallet from "../models/Wallet";
import User from "../models/User";
import { STREAK_REWARDS } from "../config/streakRewards";

export const processStreakRewards = async (
  userId: string
) => {

  const user = await User.findById(userId);

  if (!user || !user.streak) return null;

  const streak = user.streak;

  const claimed = streak.rewardsClaimed || [];

  const reward = STREAK_REWARDS.find(
    (r) =>
      r.days === streak.current &&
      !claimed.includes(r.days)
  );

  if (!reward) return streak;

  // MARK CLAIMED FIRST
  streak.rewardsClaimed.push(reward.days);

  await user.save();

  // REWARD USER
  await Wallet.updateOne(
    { userId },
    {
      $inc: {
        balanceATC: reward.reward,
      },
    }
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

  return {
    ...streak.toObject(),
    rewardAdded: reward.reward,
  };
};