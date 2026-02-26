"use client";

export default function TrustBadge({
  trusted,
  flagged,
  blocked,
}: {
  trusted: boolean;
  flagged: boolean;
  blocked: boolean;
}) {
  if (blocked)
    return <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">Blocked</span>;

  if (flagged)
    return <span className="px-2 py-1 text-xs rounded bg-orange-100 text-orange-700">Flagged</span>;

  if (trusted)
    return <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">Trusted</span>;

  return (
    <span className="px-3 py-2 text-xs rounded bg-gray-100 text-gray-600">
      New
    </span>
  );
}