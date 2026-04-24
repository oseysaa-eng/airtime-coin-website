import Transaction from "../models/Transaction";
import Wallet from "../models/Wallet";
import { STREAK_REWARDS } from "../config/streakRewards";

  export const processStreakRewards = async (
  userId: string,
  streak: any
) => {
  if (!streak) return streak;

  const claimed = streak.rewardsClaimed || [];
  streak.rewardsClaimed = claimed;

  const current = streak.current;

  const rewardsToGive = STREAK_REWARDS.filter(
    (r) => r.days === current && !claimed.includes(r.days)
  );

  if (rewardsToGive.length === 0) return streak;

  let totalReward = 0;

  for (const r of rewardsToGive) {
    totalReward += r.reward;

    await Wallet.updateOne(
      { userId },
      { $inc: { balanceATC: r.reward } }
    );

    await Transaction.create({
      userId,
      type: "BONUS",
      amount: r.reward,
      source: "STREAK_REWARD",
      meta: { streakDays: r.days },
    });

    streak.rewardsClaimed.push(r.days);
  }

  streak._rewardAdded = totalReward; // 🔥 temporary
  return streak;
};

