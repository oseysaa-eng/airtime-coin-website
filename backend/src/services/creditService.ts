import { DAILY_LIMITS } from "../config/limits";
import Transaction from "../models/Transaction";
import Wallet from "../models/Wallet";
import { resetDailyIfNeeded } from "../utils/resetDaily";

export const creditUser = async (
  userId: string,
  minutes: number,
  source: "ADS" | "CALL" | "SURVEY"
) => {
  const wallet = await Wallet.findOne({ userId });
  if (!wallet) throw new Error("Wallet not found");

  resetDailyIfNeeded(wallet);

  // SOURCE LIMIT
  if (
    source === "ADS" &&
    wallet.dailyEarned.ads + minutes > DAILY_LIMITS.adsMinutes
  ) {
    throw new Error("Daily ad limit reached");
  }

  if (
    source === "CALL" &&
    wallet.dailyEarned.calls + minutes > DAILY_LIMITS.callMinutes
  ) {
    throw new Error("Daily call limit reached");
  }

  if (
    source === "SURVEY" &&
    wallet.dailyEarned.surveys + minutes > DAILY_LIMITS.surveyMinutes
  ) {
    throw new Error("Daily survey limit reached");
  }

  // GLOBAL LIMIT
  if (wallet.todayMinutes + minutes > DAILY_LIMITS.totalMinutes) {
    throw new Error("Daily total limit reached");
  }

  
  // APPLY
  wallet.totalMinutes += minutes;
  wallet.todayMinutes += minutes;

  if (source === "ADS") wallet.dailyEarned.ads += minutes;
  if (source === "CALL") wallet.dailyEarned.calls += minutes;
  if (source === "SURVEY") wallet.dailyEarned.surveys += minutes;

  await wallet.save();

  await Transaction.create({
    userId,
    type: "EARN",
    amount: minutes,
    source,
    status: "SUCCESS",
  });

  return { success: true, minutes };
};


