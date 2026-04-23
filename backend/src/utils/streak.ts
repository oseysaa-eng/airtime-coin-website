export const updateStreak = async (user: any, todayMinutes: number) => {
  const MIN_REQUIRED = 5;

  const now = new Date();
  const today = new Date(now.toDateString());

  const last = user.streak?.lastEarnDate
    ? new Date(user.streak.lastEarnDate)
    : null;

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  let current = user.streak?.current || 0;
  let longest = user.streak?.longest || 0;

  // ❌ did not meet requirement
  if (todayMinutes < MIN_REQUIRED) {
    return user.streak;
  }

  // ✅ first time ever
  if (!last) {
    current = 1;
  }

  // ✅ same day → do nothing
  else if (last.toDateString() === today.toDateString()) {
    return user.streak;
  }

  // ✅ consecutive day
  else if (last.toDateString() === yesterday.toDateString()) {
    current += 1;
  }

  // ❌ missed a day → reset
  else {
    current = 1;
  }

  if (current > longest) longest = current;

  return {
    current,
    longest,
    lastEarnDate: today,
  };
};