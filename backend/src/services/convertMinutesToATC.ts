export function convertMinutesToATC(
  minutes: number,
  todayMinutes: number,
  trustScore: number
) {
  const BASE_RATE = 0.001;

  const tier = dailyTierMultiplier(todayMinutes);
  const trust = trustMultiplier(trustScore);

  const atc =
    minutes * BASE_RATE * tier * trust;

  return Math.max(0, Number(atc.toFixed(6)));
}
