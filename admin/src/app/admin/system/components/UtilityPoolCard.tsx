"use client";

type Props = {
  pool: any;
};

export default function UtilityPoolCard({ pool }: Props) {
  // ✅ SAFETY NORMALIZATION
  const balanceATC = Number(pool?.balanceATC ?? 0);
  const rate = Number(pool?.rate ?? 0);
  const dailyLimitATC = Number(pool?.dailyLimitATC ?? 0);
  const spentTodayATC = Number(pool?.spentTodayATC ?? 0);
  const paused = Boolean(pool?.paused);

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg">
          {pool?.utility ?? "UTILITY"}
        </h3>

        <span
          className={`text-xs px-2 py-1 rounded ${
            paused
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {paused ? "Paused" : "Active"}
        </span>
      </div>

      <div className="text-sm space-y-1">
        <div>
          <b>Balance:</b> {balanceATC.toFixed(2)} ATC
        </div>

        <div>
          <b>Rate:</b> 1 ATC → {rate}
        </div>

        <div>
          <b>Daily Limit:</b> {dailyLimitATC} ATC
        </div>

        <div>
          <b>Spent Today:</b> {spentTodayATC} ATC
        </div>
      </div>
    </div>
  );
}