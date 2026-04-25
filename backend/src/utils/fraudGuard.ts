import Wallet from "../models/Wallet";

const MAX_MINUTES_PER_DAY = 500;     // 🔥 adjust later
const MAX_MINUTES_PER_HOUR = 120;    // 🔥 anti-bot

export const checkFraudLimits = async (
  userId: string,
  minutesToAdd: number
) => {
  const wallet = await Wallet.findOne({ userId });

  if (!wallet) return { allowed: false, reason: "NO_WALLET" };

  const today = wallet.todayMinutes || 0;

  // ❌ daily cap
  if (today + minutesToAdd > MAX_MINUTES_PER_DAY) {
    return {
      allowed: false,
      reason: "DAILY_LIMIT",
    };
  }

  // ⏱ hourly check (simple version)
  const lastHourMinutes = wallet.lastHourMinutes || 0;

  if (lastHourMinutes + minutesToAdd > MAX_MINUTES_PER_HOUR) {
    return {
      allowed: false,
      reason: "HOURLY_LIMIT",
    };
  }

  return { allowed: true };
};