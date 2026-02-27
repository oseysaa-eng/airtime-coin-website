import { useEffect, useState } from "react";
import { adminAPI } from "../admin/admin";

export default function Offers() {
  const [offers, setOffers] = useState([]);

  const load = async () => {
    const res = await adminAPI.get("/");
    setOffers(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    await adminAPI.post(`/${id}/approve`);
    load();
  };

  const reject = async (id) => {
    await adminAPI.post(`/${id}/reject`);
    load();
  };

  return (
    <div>
      <h1>Offerwall</h1>

      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Network</th>
            <th>Minutes</th>
            <th>Country</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {offers.map((o) => (
            <tr key={o._id}>
              <td>{o.userId}</td>
              <td>{o.network}</td>
              <td>{o.rewardMinutes}</td>
              <td>{o.country}</td>
              <td>{o.status}</td>
              <td>
                {o.status === "pending" && (
                  <>
                    <button onClick={() => approve(o._id)}>Approve</button>
                    <button onClick={() => reject(o._id)}>Reject</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
