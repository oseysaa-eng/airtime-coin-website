export default function UtilityStats({ data }: any) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="card">
        <p className="text-sm text-gray-500">ATC Spent on Utilities</p>
        <p className="text-2xl font-bold">
          {data.totalATCSpent.toFixed(4)}
        </p>
      </div>

      <div className="card">
        <p className="text-sm text-gray-500">Total Utility Transactions</p>
        <p className="text-2xl font-bold">{data.totalTransactions}</p>
      </div>
    </div>
  );
}