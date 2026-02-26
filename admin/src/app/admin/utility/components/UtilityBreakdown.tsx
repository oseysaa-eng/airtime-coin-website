export default function UtilityBreakdown({ data }: any) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="font-semibold mb-3">Usage by Utility</h2>

      {data.map((u: any) => (
        <div key={u._id} className="flex justify-between text-sm mb-2">
          <span>{u._id}</span>
          <span>
            {u.totalATC.toFixed(4)} ATC ({u.count})
          </span>
        </div>
      ))}
    </div>
  );
}