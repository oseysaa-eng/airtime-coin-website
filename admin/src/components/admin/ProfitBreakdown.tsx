"use client";

import { useEffect, useState } from "react";
import adminApi from "@/lib/adminApi";

export default function ProfitBreakdown() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    adminApi.get("/analytics/profit").then((res) => {
      setData(res.data);
    });
  }, []);

  if (!data) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="font-semibold mb-4">📊 Breakdown</h2>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Conversion</span>
          <span className="text-blue-500">
            {data.breakdown?.conversion?.toFixed(4)} ATC
          </span>
        </div>

        <div className="flex justify-between">
          <span>Calls</span>
          <span className="text-green-500">
            {data.breakdown?.calls?.toFixed(4)} ATC
          </span>
        </div>

        <div className="flex justify-between">
          <span>Ads</span>
          <span className="text-purple-500">
            {data.breakdown?.ads?.toFixed(4)} ATC
          </span>
        </div>
      </div>
    </div>
  );
}