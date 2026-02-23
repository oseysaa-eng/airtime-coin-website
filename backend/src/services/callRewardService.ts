const MAX_SESSION_SECONDS = 20 * 60; // 20 mins
const MIN_SESSION_SECONDS = 30;      // 30 sec
const MAX_REWARD_MINUTES = 5;

export function calculateCallReward(durationSec: number): number {
  if (durationSec < MIN_SESSION_SECONDS) return 0;

  const rewardedMinutes = Math.floor(durationSec / 120); // 1 min per 2 mins

  return Math.min(rewardedMinutes, MAX_REWARD_MINUTES);
}
