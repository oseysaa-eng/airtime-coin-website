"use client";

type Pool = {
  type: string;
  balanceATC: number;
  avgDailyATC: number;
  daysLeft: number | null;
  paused?: boolean;
};

type Props = {
  pools: Pool[];
};

export default function PoolHealth({ pools }: Props) {

  if (!pools || pools.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-3">
          Reward Pool Health
        </h2>

        <p className="text-sm text-gray-500">
          No pool data available.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-6">

      <h2 className="text-lg font-semibold mb-4">
        Reward Pool Health
      </h2>

      <div className="space-y-3">

        {pools.map(pool => {

          const health =
            pool.daysLeft === null
              ? "healthy"
              : pool.daysLeft < 7
              ? "critical"
              : pool.daysLeft < 30
              ? "warning"
              : "healthy";

          const color =
            health === "critical"
              ? "bg-red-500"
              : health === "warning"
              ? "bg-orange-500"
              : "bg-emerald-500";

          return (

            <div key={pool.type}>

              <div className="flex justify-between text-sm mb-1">

                <span className="font-medium">
                  {pool.type}
                </span>

                <span className="text-gray-500">
                  {pool.daysLeft ?? "∞"} days left
                </span>

              </div>

              <div className="w-full bg-gray-200 rounded h-2">

                <div
                  className={`${color} h-2 rounded`}
                  style={{
                    width: `${
                      pool.daysLeft === null
                        ? 100
                        : Math.min(100, pool.daysLeft)
                    }%`,
                  }}
                />

              </div>

            </div>

          );

        })}

      </div>

    </div>
  );
}