export default function UtilityPools({ pools }: any) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {pools.map((p: any) => (
        <div key={p.utility} className="card">
          <h3 className="font-bold">
            {p.utility}
          </h3>

          <p>Balance: {p.balanceATC.toFixed(4)} ATC</p>
          <p>Daily Limit: {p.dailyLimitATC}</p>

          <p className={p.paused ? "text-red-600" : "text-green-600"}>
            {p.paused ? "Paused" : "Active"}
          </p>
        </div>
      ))}
    </div>
  );
}