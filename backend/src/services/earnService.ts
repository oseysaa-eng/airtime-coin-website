
import Wallet from "../models/Wallet";
import { checkFraudLimits } from "../utils/fraudGuard";


export const applyEarning = async (
  userId: string,
  minutes: number,
  atc: number
) => {
  const wallet = await Wallet.findOne({ userId });

  if (!wallet) throw new Error("WALLET_NOT_FOUND");

  /* ================= FRAUD ================= */
  const fraud = await checkFraudLimits(userId, minutes);

  if (!fraud.allowed) {
    throw new Error(fraud.reason);
  }

  /* ================= HOURLY RESET ================= */
  const now = new Date();
  const last = new Date(wallet.lastHourReset || now);

  if (now.getHours() !== last.getHours()) {
    wallet.lastHourMinutes = 0;
    wallet.lastHourReset = now;
  }

  /* ================= UPDATE ================= */
  wallet.lastHourMinutes += minutes;
  wallet.todayMinutes += minutes;
  wallet.totalMinutes += minutes;

  wallet.balanceATC += atc;

  await wallet.save();

  return wallet;
};