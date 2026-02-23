import Stake from "../models/Stake";
import Wallet from "../models/Wallet";

export const processMaturedStakes = async () => {
  const now = new Date();

  const matured = await Stake.find({
    status: "active",
    unlockDate: { $lte: now },
  });

  for (const stake of matured) {
    const wallet = await Wallet.findOne({ userId: stake.userId });
    if (!wallet) continue;

    // Credit original amount + reward
    wallet.balanceATC += stake.amount + stake.rewardAmount;
    await wallet.save();

    stake.status = "completed";
    await stake.save();
  }
};
