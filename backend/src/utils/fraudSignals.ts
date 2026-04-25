import CallSession from "../models/CallSession";
import Wallet from "../models/Wallet";

/**
 * Detect abnormal earning spike
 */
export const detectAbnormalEarning = async (
  userId: string,
  minutes: number
) => {
  if (minutes > 20) {
    return true;
  }
  return false;
};

/**
 * Detect rapid actions (bot-like)
 */
export const detectRapidActions = async (
  userId: string
) => {
  const lastMinute = new Date(Date.now() - 60 * 1000);

  const count = await CallSession.countDocuments({
    userId,
    createdAt: { $gte: lastMinute },
  });

  return count > 10;
};

/**
 * Detect suspicious call behavior
 */
export const detectSuspiciousCall = (duration: number) => {
  return duration < 5; // too short → farming
};