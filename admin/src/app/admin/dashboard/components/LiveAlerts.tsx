"use client";

export default function LiveAlerts({ warnings = [] }: any) {
  return (
    <div className="card p-4">
      <h3 className="font-semibold mb-3">🚨 Live Alerts</h3>

      {warnings.length === 0 && (
        <p className="text-gray-400">No alerts</p>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {warnings.map((w: any, i: number) => (
          <div
            key={i}
            className="p-2 bg-red-50 border border-red-200 rounded"
          >
            <p className="text-sm font-semibold">{w.type}</p>
            <p className="text-xs text-gray-600">{w.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}