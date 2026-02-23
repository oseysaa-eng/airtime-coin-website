export const resetDailyIfNeeded = (wallet: any) => {
  const now = new Date();
  const last = new Date(wallet.lastDailyReset);

  if (now.toDateString() !== last.toDateString()) {
    wallet.dailyEarned = { ads: 0, calls: 0, surveys: 0 };
    wallet.todayMinutes = 0;
    wallet.lastDailyReset = now;
  }
};
