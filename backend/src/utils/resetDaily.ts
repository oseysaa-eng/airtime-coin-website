// ================= USER DAILY RESET =================
export const resetDailyIfNeeded = (wallet: any) => {
  const now = new Date();
  const last = wallet.lastDailyReset
    ? new Date(wallet.lastDailyReset)
    : null;

  if (!last || now.toDateString() !== last.toDateString()) {
    wallet.dailyEarned = { ads: 0, calls: 0, surveys: 0 };
    wallet.todayMinutes = 0;
    wallet.lastDailyReset = now;
  }
};


// ================= SYSTEM PROFIT RESET =================
export const resetProfitIfNewDay = async (systemWallet: any) => {
  const now = new Date();
  const last = systemWallet.lastReset
    ? new Date(systemWallet.lastReset)
    : null;

  if (!last || now.toDateString() !== last.toDateString()) {
    systemWallet.dailyProfitATC = 0;
    systemWallet.lastReset = now;

    await systemWallet.save();
  }
};