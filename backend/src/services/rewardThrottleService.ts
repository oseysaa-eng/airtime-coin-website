// src/services/rewardThrottleService.ts
export function getPoolMultiplier(pool: any) {
  const remaining = pool.balanceATC;
  const daily = pool.dailyLimitATC;

  if (remaining <= 0) return 0;

  const ratio = remaining / daily;

  if (ratio >= 0.5) return 1;
  if (ratio >= 0.3) return 0.75;
  if (ratio >= 0.15) return 0.5;
  if (ratio >= 0.05) return 0.25;

  return 0;
}
