const normalizeDate = (date: Date) =>
  date.toISOString().split("T")[0];

export const updateStreak = async (
  user: any,
  todayMinutes: number
) => {

  const MIN_REQUIRED = 5;

  if (todayMinutes < MIN_REQUIRED) {
    return user.streak;
  }

  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const last = user.streak?.lastEarnDate
    ? new Date(user.streak.lastEarnDate)
    : null;

  let current = user.streak?.current || 0;
  let longest = user.streak?.longest || 0;

  const todayKey = normalizeDate(today);
  const yesterdayKey = normalizeDate(yesterday);

  const lastKey = last
    ? normalizeDate(last)
    : null;

  // ✅ first streak ever
  if (!lastKey) {
    current = 1;
  }

  // ✅ already counted today
  else if (lastKey === todayKey) {
    return user.streak;
  }

  // ✅ consecutive day
  else if (lastKey === yesterdayKey) {
    current += 1;
  }

  // ❌ missed streak
  else {
    current = 1;
  }

  longest = Math.max(longest, current);

  return {
    current,
    longest,
    lastEarnDate: today,
  };
};