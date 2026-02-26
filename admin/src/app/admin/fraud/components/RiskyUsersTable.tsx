export default function RiskyUsersTable({ users }: any) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">
        High-Risk Users
      </h2>

      <table className="w-full border">
        <thead>
          <tr className="bg-zinc-100 text-sm">
            <th className="p-2 text-left">Email</th>
            <th className="p-2">Trust</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u: any) => (
            <tr key={u._id} className="border-t">
              <td className="p-2">
                {u.userId?.email}
              </td>
              <td className="p-2 text-center">
                {u.score}
              </td>
              <td className="p-2 text-center">
                {u.score < 40
                  ? "BLOCKED"
                  : "LIMITED"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}