export function resetDailyIfNeeded(wallet: any) {
  const now = new Date();
  const last = new Date(wallet.lastDailyReset || 0);

  if (now.toDateString() !== last.toDateString()) {
    wallet.dailyEarned = { ads: 0, calls: 0, surveys: 0 };
    wallet.todayMinutes = 0;
    wallet.lastDailyReset = now;
  }
}

export async function resetProfitIfNewDay(systemWallet: any) {
  const now = new Date();

  if (
    !systemWallet.lastReset ||
    now.toDateString() !== new Date(systemWallet.lastReset).toDateString()
  ) {
    systemWallet.dailyProfitATC = 0;
    systemWallet.lastReset = now;

    await systemWallet.save();
  }
}