"use client";

import clsx from "clsx";

type BurnItem = {
  type: string;                // CALL | ADS | SURVEY | CONVERSION
  avgDailyATC: number;         // average ATC burned per day
  balanceATC: number;          // pool balance
  daysLeft: number | null;     // runway
  paused: boolean;
};

type Emission = {
  phase: number;
  multiplier: number;
  nextHalvingEstimate?: string;
};

type BurnSummaryProps = {
  summary: {
    pools: BurnItem[];
    emission?: Emission;
  };
};

export default function BurnSummary({ summary }: BurnSummaryProps) {
  const pools = summary?.pools || [];
  const emission = summary?.emission;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">
        Burn Rate & Runway
      </h2>

      {/* Emission Info */}
      {emission && (
        <div className="rounded-lg border bg-gray-50 p-4 text-sm">
          <div className="flex flex-wrap gap-6">
            <Info label="Emission Phase" value={emission.phase} />
            <Info
              label="Emission Multiplier"
              value={`×${emission.multiplier}`}
            />
            {emission.nextHalvingEstimate && (
              <Info
                label="Last Halving"
                value={new Date(
                  emission.nextHalvingEstimate
                ).toLocaleDateString()}
              />
            )}
          </div>
        </div>
      )}

      {/* Pool Burn Table */}
      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-3">Pool</th>
              <th className="px-4 py-3">Avg / Day (ATC)</th>
              <th className="px-4 py-3">Balance</th>
              <th className="px-4 py-3">Runway</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {pools.map(p => (
              <tr
                key={p.type}
                className="border-t last:border-b-0"
              >
                <td className="px-4 py-3 font-medium">
                  {p.type}
                </td>

                <td className="px-4 py-3">
                  {p.avgDailyATC.toFixed(4)}
                </td>

                <td className="px-4 py-3">
                  {p.balanceATC.toFixed(2)}
                </td>

                <td className="px-4 py-3">
                  {p.daysLeft === null
                    ? "—"
                    : `${p.daysLeft} days`}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={clsx(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      p.paused
                        ? "bg-red-100 text-red-700"
                        : p.daysLeft !== null &&
                          p.daysLeft < 7
                        ? "bg-orange-100 text-orange-700"
                        : "bg-teal-100 text-teal-700"
                    )}
                  >
                    {p.paused
                      ? "Paused"
                      : p.daysLeft !== null &&
                        p.daysLeft < 7
                      ? "Low Runway"
                      : "Healthy"}
                  </span>
                </td>
              </tr>
            ))}

            {pools.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  No burn data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* -----------------------------
   Small Info Block
------------------------------ */

function Info({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <p className="text-gray-500 text-xs">
        {label}
      </p>
      <p className="font-semibold">
        {value}
      </p>
    </div>
  );
}
