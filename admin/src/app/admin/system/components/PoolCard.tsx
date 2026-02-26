"use client";

import clsx from "clsx";

type Pool = {
  type: string;
  balanceATC: number;
  dailyLimitATC: number;
  spentTodayATC: number;
  paused: boolean;
};

export default function PoolCard({ pool }: { pool: Pool }) {
  const remaining = pool.balanceATC;
  const usageRatio =
    pool.dailyLimitATC > 0
      ? pool.spentTodayATC / pool.dailyLimitATC
      : 0;

  const status =
    pool.paused
      ? "paused"
      : remaining <= 0
      ? "empty"
      : usageRatio > 0.9
      ? "critical"
      : usageRatio > 0.7
      ? "warning"
      : "healthy";

  return (
    <div
      className={clsx(
        "rounded-xl border p-4 shadow-sm transition",
        status === "healthy" && "border-teal-200 bg-teal-50",
        status === "warning" && "border-yellow-300 bg-yellow-50",
        status === "critical" && "border-red-300 bg-red-50",
        status === "empty" && "border-red-500 bg-red-100",
        status === "paused" && "border-gray-300 bg-gray-100"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg">
          {pool.type} Pool
        </h3>

        <StatusBadge status={status} />
      </div>

      {/* Balance */}
      <div className="space-y-2 text-sm">
        <Stat label="Balance">
          {remaining.toFixed(4)} ATC
        </Stat>

        <Stat label="Daily Limit">
          {pool.dailyLimitATC.toFixed(4)} ATC
        </Stat>

        <Stat label="Spent Today">
          {pool.spentTodayATC.toFixed(4)} ATC
        </Stat>
      </div>

      {/* Progress Bar */}
      {!pool.paused && pool.dailyLimitATC > 0 && (
        <div className="mt-4">
          <div className="h-2 w-full rounded bg-gray-200 overflow-hidden">
            <div
              className={clsx(
                "h-full transition-all",
                status === "healthy" && "bg-teal-500",
                status === "warning" && "bg-yellow-500",
                status === "critical" && "bg-red-500"
              )}
              style={{
                width: `${Math.min(usageRatio * 100, 100)}%`,
              }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-600">
            {(usageRatio * 100).toFixed(1)}% of daily limit used
          </p>
        </div>
      )}

      {pool.paused && (
        <p className="mt-3 text-xs font-medium text-gray-600">
          This pool is currently paused
        </p>
      )}
    </div>
  );
}

/* ----------------------------------
   Small helpers
----------------------------------- */

function Stat({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    healthy: "Healthy",
    warning: "Warning",
    critical: "Critical",
    empty: "Empty",
    paused: "Paused",
  };

  return (
    <span
      className={clsx(
        "px-2 py-1 rounded-full text-xs font-semibold",
        status === "healthy" && "bg-teal-100 text-teal-700",
        status === "warning" && "bg-yellow-100 text-yellow-700",
        status === "critical" && "bg-red-100 text-red-700",
        status === "empty" && "bg-red-200 text-red-800",
        status === "paused" && "bg-gray-200 text-gray-700"
      )}
    >
      {map[status]}
    </span>
  );
}
