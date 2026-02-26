export default function UtilityKPI({ data }: any) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="card">
        <p>Total ATC Spent</p>
        <h2>{data.totalATCSpent.toFixed(4)}</h2>
      </div>

      <div className="card">
        <p>Treasury Balance</p>
        <h2>
          {data.treasury?.balanceATC?.toFixed(4)}
        </h2>
      </div>

      <div className="card">
        <p>Total Burned</p>
        <h2>
          {data.treasury?.totalBurnedATC?.toFixed(4)}
        </h2>
      </div>

      <div className="card">
        <p>Utility Pools</p>
        <h2>{data.pools.length}</h2>
      </div>
    </div>
  );
}