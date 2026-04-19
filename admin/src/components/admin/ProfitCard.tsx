"use client";

import { useEffect, useState } from "react";
import adminApi from "@/lib/adminApi";
import { onAdminSocket } from "@/lib/adminSocket";

export default function ProfitCard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await adminApi.get("/analytics/profit");
      setData(res.data);
    } catch (err) {
      console.error("❌ Profit load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    /* ================= SOCKET ================= */
    const unsub = onAdminSocket("ADMIN_ANALYTICS_UPDATE", (payload) => {
      if (!payload) return;

      if (payload.type === "PROFIT_UPDATE") {
        setData((prev: any) => {
          if (!prev) return prev;

          return {
            ...prev,
            totalProfitATC:
              (prev.totalProfitATC || 0) + (payload.amount || 0),
            dailyProfitATC:
              (prev.dailyProfitATC || 0) + (payload.amount || 0),
          };
        });
      } else {
        // fallback refresh
        load();
      }
    });

    return () => {
      unsub();
    };
  }, []);

  if (loading || !data) {
    return (
      <div className="p-6 bg-white rounded-xl shadow">
        Loading profit...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">
        💰 Profit Overview
      </h2>

      {/* TOTAL */}
      <div className="flex justify-between">
        <span className="text-gray-500">Total Profit</span>
        <span className="font-bold text-emerald-600">
          {(data.totalProfitATC || 0).toFixed(4)} ATC
        </span>
      </div>

      {/* DAILY */}
      <div className="flex justify-between">
        <span className="text-gray-500">Today</span>
        <span className="font-bold text-blue-600">
          {(data.dailyProfitATC || 0).toFixed(4)} ATC
        </span>
      </div>

      {/* CONVERSIONS */}
      <div className="flex justify-between">
        <span className="text-gray-500">Conversions</span>
        <span className="font-bold">
          {data.totalConversions || 0}
        </span>
      </div>

      <hr />

      {/* BREAKDOWN */}
      <div>
        <p className="text-sm text-gray-500 mb-2">
          Breakdown
        </p>

        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Calls</span>
            <span className="text-emerald-500">
              {(data.breakdown?.calls || 0).toFixed(4)} ATC
            </span>
          </div>

          <div className="flex justify-between">
            <span>Conversion</span>
            <span className="text-blue-500">
              {(data.breakdown?.conversion || 0).toFixed(4)} ATC
            </span>
          </div>

          <div className="flex justify-between">
            <span>Ads</span>
            <span className="text-purple-500">
              {(data.breakdown?.ads || 0).toFixed(4)} ATC
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}