"use client";

import { useEffect, useState, useCallback } from "react";
import adminApi from "@/lib/adminApi";

import OverviewCards from "./components/OverviewCards";
import TrustChart from "./components/TrustChart";
import RunwayWarning from "@/components/RunwayWarning";
import BurnRateTable from "./components/BurnRateTable";
import DateRangeFilter from "./components/DateRangeFilter";

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<any>(null);
  const [burn, setBurn] = useState<any[]>([]);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================================
     LOAD DATA (SAFE + OPTIMIZED)
  ================================= */
  const load = useCallback(async (f?: string, t?: string) => {
    setLoading(true);
    setError("");

    try {
      const [overviewRes, burnRes] = await Promise.all([
        adminApi.get("/analytics", {
          params: { from: f ?? from, to: t ?? to },
        }),
        adminApi.get("/analytics/burn"),
      ]);

      setOverview(overviewRes.data);
      setBurn(burnRes.data?.burnRate || []);

    } catch (err: any) {
      console.error("Analytics load error:", err);
      setError("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  /* ================================
     INITIAL LOAD
  ================================= */
  useEffect(() => {
  const interval = setInterval(() => {
    load();
  }, 30000);

  return () => clearInterval(interval);
}, [load]);

  /* ================================
     HANDLE FILTER CHANGE (FIXED)
  ================================= */
  const handleFilterChange = (f: string, t: string) => {
    setFrom(f);
    setTo(t);

    // ✅ PASS NEW VALUES DIRECTLY (NO STALE STATE)
    load(f, t);
  };

  /* ================================
     LOADING UI
  ================================= */
  if (loading && !overview) {
    return <p className="p-6">Loading analytics...</p>;
  }

  /* ================================
     ERROR UI
  ================================= */
  if (error) {
    return (
      <div className="p-6 text-red-500">
        {error}
      </div>
    );
  }

  /* ================================
     MAIN UI
  ================================= */
  return (
    <div className="p-6 space-y-6">

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics</h1>

        <DateRangeFilter
          from={from}
          to={to}
          onChange={handleFilterChange}
        />
      </div>

      {/* 🔄 Refresh Indicator */}
      {loading && (
        <p className="text-sm text-gray-500">
          Updating...
        </p>
      )}

      <OverviewCards data={overview} />

      <TrustChart
        trust={overview?.trustDistribution || []}
      />

      <RunwayWarning pools={burn} />

      <BurnRateTable data={burn} />

    </div>
  );
}