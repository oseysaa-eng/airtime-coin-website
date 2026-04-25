import Wallet from "../models/Wallet";
import { EARNING_CAPS } from "../config/earningCaps";

export const checkEarningLimits = async (
  userId: string,
  minutes: number,
  source: string
) => {
  const wallet = await Wallet.findOne({ userId });

  if (!wallet) {
    return { allowed: false, reason: "Wallet not found" };
  }

  const now = new Date();

  /* ================= HOURLY RESET ================= */
  const lastHour = new Date(wallet.lastHourReset || now);

  if (now.getHours() !== lastHour.getHours()) {
    wallet.lastHourMinutes = 0;
    wallet.lastHourReset = now;
  }

  /* ================= DAILY RESET ================= */
  const lastDay = new Date(wallet.lastDailyReset || now);

  if (now.toDateString() !== lastDay.toDateString()) {
    wallet.todayMinutes = 0;
    wallet.dailySourceMinutes = {};
    wallet.lastDailyReset = now;
  }

  /* ================= CHECK LIMITS ================= */

  // ⏱ hourly
  if (wallet.lastHourMinutes + minutes > EARNING_CAPS.hourly) {
    return { allowed: false, reason: "Hourly earning limit reached" };
  }

  // 📅 daily
  if (wallet.todayMinutes + minutes > EARNING_CAPS.daily) {
    return { allowed: false, reason: "Daily earning limit reached" };
  }

  // 🎯 per source
  const used = wallet.dailySourceMinutes?.[source] || 0;
  const cap = EARNING_CAPS.perSource[source] || 9999;

  if (used + minutes > cap) {
    return { allowed: false, reason: `${source} limit reached` };
  }

  return { allowed: true };
};