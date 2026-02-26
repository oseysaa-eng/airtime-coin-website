export default function UtilityRevenueTable({ rows }: any) {
  return (
    <div className="card">
      <h3 className="font-semibold mb-3">
        Utility Usage
      </h3>

      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Utility</th>
            <th>Transactions</th>
            <th>ATC Spent</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r: any) => (
            <tr key={r._id}>
              <td>{r._id}</td>
              <td>{r.count}</td>
              <td>{r.atc.toFixed(4)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}