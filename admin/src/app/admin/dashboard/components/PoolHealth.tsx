"use client";

import adminApi from "@/lib/adminApi";
import { useEffect, useState } from "react";

type Pool = {
  type: string;
  dailyLimitATC: number;
  spentTodayATC: number;
};



export default function PoolHealth() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.get("/analytics").then(res => {
      const payload = res.data;

      // ✅ Normalize response
      if (Array.isArray(payload)) {
        setPools(payload);
      } else if (Array.isArray(payload?.data)) {
        setPools(payload.data);
      } else {
        console.warn("Unexpected pool response:", payload);
        setPools([]);
      }

      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="font-semibold mb-4">Pool Health</h3>
        <p className="text-sm text-gray-500">Loading pool status…</p>
      </div>
    );
  }

  if (pools.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="font-semibold mb-4">Pool Health</h3>
        <p className="text-sm text-gray-500">No pool data available</p>
      </div>
    );
  }
  

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="font-semibold mb-4">Pool Health</h3>

      <div className="space-y-4">
        {pools.map(pool => {
          const pct =
            pool.dailyLimitATC > 0
              ? (pool.spentTodayATC / pool.dailyLimitATC) * 100
              : 0;

          const color =
            pct > 80
              ? "bg-red-500"
              : pct > 50
              ? "bg-yellow-400"
              : "bg-green-500";

          return (
            <div key={pool.type}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{pool.type}</span>
                <span>{pct.toFixed(0)}%</span>
              </div>

              <div className="w-full h-2 bg-gray-200 rounded">
                <div
                  className={`h-2 rounded ${color}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}