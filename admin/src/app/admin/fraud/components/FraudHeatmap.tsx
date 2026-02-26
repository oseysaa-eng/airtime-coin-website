"use client";

export default function FraudHeatmap({
  data,
}: {
  data: { country: string; count: number }[];
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-4">Fraud Distribution</h3>

      <div className="space-y-2">
        {data.map(row => (
          <div key={row.country} className="flex items-center gap-3">
            <div className="w-20 text-sm">{row.country}</div>
            <div className="flex-1 bg-zinc-200 rounded h-2">
              <div
                className="bg-red-500 h-2 rounded"
                style={{ width: `${row.count}%` }}
              />
            </div>
            <div className="text-xs">{row.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}