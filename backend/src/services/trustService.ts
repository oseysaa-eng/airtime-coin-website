import UserTrust from "../models/UserTrust";

export async function decayTrust(
  userId: string,
  amount: number,
  reason: string
) {
  const trust =
    (await UserTrust.findOne({ userId })) ||
    (await UserTrust.create({ userId }));

  trust.score = Math.max(0, trust.score - amount);
  trust.lastDecayReason = reason;
  trust.lastUpdated = new Date();

  await trust.save();
}

export async function recoverTrust(
  userId: string,
  amount: number,
  reason: string
) {
  const trust = await UserTrust.findOne({ userId });
  if (!trust) return;

  trust.score = Math.min(100, trust.score + amount);
  trust.lastRecoveryReason = reason;
  trust.lastUpdated = new Date();

  await trust.save();
}