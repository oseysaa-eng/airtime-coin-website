export default function UtilityRecent({ rows }: any) {
  return (
    <div className="card">
      <h2 className="font-semibold mb-3">Recent Utility Activity</h2>

      {rows.map((r: any) => (
        <div key={r._id} className="border-b py-2 text-sm">
          <div>
            {r.source} — {r.amount.toFixed(4)} ATC
          </div>
          <div className="text-xs text-gray-500">
            {new Date(r.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}


