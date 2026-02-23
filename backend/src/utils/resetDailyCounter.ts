export function resetIfNewDay(pool: any) {
  const now = new Date();

  if (!pool.lastReset) {
    pool.lastReset = now;
    pool.spentTodayATC = 0;
    return;
  }

  if (now.toDateString() !== pool.lastReset.toDateString()) {
    pool.spentTodayATC = 0;
    pool.lastReset = now;
  }
}