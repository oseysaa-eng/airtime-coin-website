"use client";

type BurnPool = {
  type: string;
  balanceATC: number;
  avgDailyATC: number;
  daysLeft: number | null;
};

type Props = {
  data: BurnPool[];
};

export default function BurnSnapshot({ data }: Props) {

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-3">
          Burn Snapshot
        </h2>

        <p className="text-sm text-gray-500">
          No burn data available.
        </p>
      </div>
    );
  }

  const totalBalance = data.reduce(
    (sum, pool) => sum + (pool.balanceATC || 0),
    0
  );

  const totalDailyBurn = data.reduce(
    (sum, pool) => sum + (pool.avgDailyATC || 0),
    0
  );

  const runway =
    totalDailyBurn > 0
      ? Math.floor(totalBalance / totalDailyBurn)
      : null;

  return (
    <div className="bg-white rounded-xl border p-6">

      <h2 className="text-lg font-semibold mb-4">
        Emission Runway
      </h2>

      <div className="space-y-3">

        <Stat
          label="Total Balance"
          value={totalBalance.toFixed(2) + " ATC"}
        />

        <Stat
          label="Daily Burn"
          value={totalDailyBurn.toFixed(4) + " ATC"}
        />

        <Stat
          label="Runway"
          value={runway ? runway + " days" : "∞"}
        />

      </div>

    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}