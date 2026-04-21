"use client";

import { useEffect, useState } from "react";
import adminApi from "@/lib/adminApi";

export default function ProfitChart() {
  const [data, setData] = useState<number[]>([]);

  useEffect(() => {
    adminApi.get("/analytics/profit-trend").then((res) => {
      setData(res.data.trend || []);
    });
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="font-semibold mb-4">📈 Profit Trend (7 days)</h2>

      <div className="flex items-end gap-2 h-40">
        {data.map((v, i) => (
          <div
            key={i}
            className="bg-emerald-500 w-full rounded"
            style={{ height: `${v * 5}px` }}
          />
        ))}
      </div>
    </div>
  );
}