export default function UtilityBreakdown({ rows }: any) {
  return (
    <div className="card">
      <h2 className="font-semibold mb-3">Utility Breakdown</h2>

      {rows.map((r: any) => (
        <div key={r._id} className="flex justify-between text-sm py-1">
          <span>{r._id}</span>
          <span>
            {r.atc.toFixed(4)} ATC ({r.count})
          </span>
        </div>
      ))}
    </div>
  );
}