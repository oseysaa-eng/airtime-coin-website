"use client";

import adminApi from "@/lib/adminApi";
import { useEffect, useState } from "react";

import BurnSnapshot from "./components/BurnSnapshot";
import PoolHealth from "./components/PoolHealth";
import QuickActions from "./components/QuickActions";
import RecentWarnings from "./components/RecentWarnings";
import StatCard from "./components/StatCard";

import ChartsPanel from "./components/ChartsPanel";
import LiveAlerts from "./components/LiveAlerts";
import RealtimeProvider from "./components/RealtimeProvider";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* ================================
     LOAD DASHBOARD
  ================================= */
  const load = async () => {
    try {
      const res = await adminApi.get("/analytics");
      setData(res.data);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ================================
     AUTO REFRESH (BACKUP)
  ================================= */
  useEffect(() => {
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return <p className="p-6">Loading dashboard…</p>;
  }

  return (
    <div className="space-y-8 p-6">

      {/* 🔥 REALTIME SOCKET */}
      <RealtimeProvider onUpdate={setData} />

      {/* KPI */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Users" value={data.users} />
        <StatCard label="Minutes" value={data.minutes} />
        <StatCard label="ATC Minted" value={data.atcMinted} />
        <StatCard label="Fraud Alerts" value={data.flaggedCalls} />
      </div>

      {/* 📊 CHARTS */}
      <ChartsPanel data={data} />

      {/* 🏦 TREASURY */}
      <div className="card">
        <p className="text-sm text-gray-500">Treasury</p>
        <p className="text-2xl font-bold">
          {Number(data.atcMinted || 0).toFixed(4)} ATC
        </p>
      </div>

      {/* ⚡ POOLS */}
      <PoolHealth pools={data.pools || []} />

      {/* 🔥 BURN + ALERTS */}
      <div className="grid grid-cols-2 gap-6">
        <BurnSnapshot data={data.burn || []} />
        <LiveAlerts warnings={data.warnings || []} />
        <RecentWarnings warnings={data.warnings} />
      </div>

      {/* QUICK ACTIONS */}
      <QuickActions />

    </div>
  );
}