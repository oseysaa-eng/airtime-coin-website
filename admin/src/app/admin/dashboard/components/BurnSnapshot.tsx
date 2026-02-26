"use client";

import adminApi from "@/lib/adminApi";
import { useEffect, useState } from "react";

type BurnRow = {
  type: string;
  avgDailyATC: number;
  balanceATC: number;
  daysLeft: number | null;
};

export default function BurnSnapshot() {
  const [rows, setRows] = useState<BurnRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.get("/analytics").then(res => {
      const payload = res.data;

      // ✅ Normalize ALL known backend shapes
      if (Array.isArray(payload)) {
        setRows(payload);
      } else if (Array.isArray(payload?.result)) {
        setRows(payload.result);
      } else if (Array.isArray(payload?.data)) {
        setRows(payload.data);
      } else {
        console.warn("Unexpected burn-rate payload:", payload);
        setRows([]);
      }

      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="font-semibold mb-3">Burn Snapshot</h3>
        <p className="text-sm text-gray-500">Loading burn data…</p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="font-semibold mb-3">Burn Snapshot</h3>
        <p className="text-sm text-gray-500">No burn data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="font-semibold mb-4">Burn Snapshot</h3>

      <div className="space-y-3">
        {rows.map(row => (
          <div
            key={row.type}
            className="flex justify-between items-center text-sm"
          >
            <span className="font-medium">{row.type}</span>

            <span className="text-gray-600">
              {row.avgDailyATC.toFixed(4)} ATC / day
            </span>

            <span
              className={`font-semibold ${
                row.daysLeft !== null && row.daysLeft < 7
                  ? "text-red-500"
                  : "text-green-600"
              }`}
            >
              {row.daysLeft !== null ? `${row.daysLeft} days left` : "∞"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}