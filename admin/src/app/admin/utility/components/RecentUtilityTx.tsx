export default function RecentUtilityTx({ txs }: any) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="font-semibold mb-3">Recent Utility Transactions</h2>

      {txs.map((t: any) => (
        <div key={t._id} className="text-sm border-b py-2">
          <b>{t.source}</b> − {t.amount} ATC
          <div className="text-xs text-gray-500">
            {new Date(t.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}