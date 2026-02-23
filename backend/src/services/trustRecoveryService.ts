import UserTrust from "../models/UserTrust";

export async function recoverTrust(userId: string) {
  const trust =
    (await UserTrust.findOne({ userId })) ||
    (await UserTrust.create({ userId }));

  const now = new Date();

  // ⏱ Recover only once every 24h
  if (
    trust.lastRecoveryAt &&
    now.getTime() - trust.lastRecoveryAt.getTime() < 24 * 60 * 60 * 1000
  ) {
    return trust;
  }

  // 🟢 Recover trust slowly
  if (trust.score < 100) {
    trust.score += 2;
    if (trust.score > 100) trust.score = 100;

    trust.lastRecoveryAt = now;
    await trust.save();
  }

  return trust;
}
