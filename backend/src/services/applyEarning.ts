import Wallet from "../models/Wallet";

export const applyEarningToWallet = async (
  userId: string,
  minutes: number,
  atc: number,
  source: string
) => {
  const wallet = await Wallet.findOne({ userId });

  if (!wallet) throw new Error("WALLET_NOT_FOUND");

  const now = new Date();

  /* ================= HOURLY ================= */
  const lastHour = new Date(wallet.lastHourReset || now);

  if (now.getHours() !== lastHour.getHours()) {
    wallet.lastHourMinutes = 0;
    wallet.lastHourReset = now;
  }

  /* ================= DAILY ================= */
  const lastDay = new Date(wallet.lastDailyReset || now);

  if (now.toDateString() !== lastDay.toDateString()) {
    wallet.todayMinutes = 0;
    wallet.dailySourceMinutes = {};
    wallet.lastDailyReset = now;
  }

  /* ================= UPDATE ================= */
  wallet.lastHourMinutes += minutes;
  wallet.todayMinutes += minutes;
  wallet.totalMinutes += minutes;

  wallet.balanceATC += atc;

  // 🎯 per source
  if (!wallet.dailySourceMinutes) {
    wallet.dailySourceMinutes = {};
  }

  wallet.dailySourceMinutes[source] =
    (wallet.dailySourceMinutes[source] || 0) + minutes;

  await wallet.save();

  return wallet;
};