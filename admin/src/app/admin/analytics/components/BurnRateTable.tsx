
"use client";

export default function BurnRateTable({ data = [] }: { data: any[] }) {
  const exportCSV = () => {
    const header = ["Pool", "Balance ATC", "Avg Daily Burn", "Days Left", "Paused"];

    const body = data.map(r => [
      r.type,
      r.balanceATC,
      r.avgDailyATC,
      r.daysLeft ?? "∞",
      r.paused ? "Yes" : "No",
    ]);

    const csv = [header, ...body].map(r => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "burn-rate.csv";
    a.click();
  };

  return (
    <div className="card">
      <div className="flex justify-between mb-3">
        <h2 className="font-semibold">Reward Pool Burn Rate</h2>

        <button
          onClick={exportCSV}
          className="text-sm border px-3 py-1 rounded hover:bg-zinc-100"
        >
          Export CSV
        </button>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-gray-500">
            <th>Pool</th>
            <th>Balance</th>
            <th>Avg / Day</th>
            <th>Days Left</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {data.map(r => (
            <tr key={r.type} className="border-b">
              <td>{r.type}</td>
              <td>{r.balanceATC?.toFixed?.(4) ?? 0}</td>
              <td>{r.avgDailyATC?.toFixed?.(4) ?? 0}</td>
              <td>{r.daysLeft ?? "∞"}</td>
              <td>{r.paused ? "Paused" : "Active"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
