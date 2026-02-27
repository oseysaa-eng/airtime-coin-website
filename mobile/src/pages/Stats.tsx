import { useEffect, useState } from "react";
import { adminAPI } from "../admin/admin";

export default function Stats() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    adminAPI.get("/stats").then((res) => setStats(res.data.daily));
  }, []);

  return (
    <div>
      <h2>Offerwall – Last 7 Days</h2>
      <ul>
        {stats.map((d) => (
          <li key={d._id}>
            {d._id}: {d.totalMinutes} mins ({d.count})
          </li>
        ))}
      </ul>
    </div>
  );
}
