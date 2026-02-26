type Props = {
  pools?: any[];
};

export default function RunwayWarning({ pools }: Props) {
  // ✅ HARD GUARD
  if (!Array.isArray(pools) || pools.length === 0) {
    return null;
  }

  const critical = pools.filter(
    p =>
      !p.paused &&
      typeof p.daysLeft === "number" &&
      p.daysLeft < 30
  );

  if (critical.length === 0) return null;

  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded">
      <h3 className="font-semibold text-red-700">
        ⚠ Low Reward Pool Runway
      </h3>

      <ul className="text-sm mt-2 space-y-1">
        {critical.map(p => (
          <li key={p.type}>
            {p.type}: {p.daysLeft} days remaining
          </li>
        ))}
      </ul>
    </div>
  );
}