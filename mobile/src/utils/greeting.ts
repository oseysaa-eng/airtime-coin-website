export function getGreeting(name?: string) {

  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12)
    return `🌅 Good morning, ${name || "User"}`;

  if (hour >= 12 && hour < 17)
    return `☀️ Good afternoon, ${name || "User"}`;

  if (hour >= 17 && hour < 22)
    return `🌆 Good evening, ${name || "User"}`;

  return `🌙 Good night, ${name || "User"}`;
}

