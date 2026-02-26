"use client";

import adminApi from "@/lib/adminApi";
import { useEffect, useState } from "react";
import BurnSnapshot from "./components/BurnSnapshot";
import PoolHealth from "./components/PoolHealth";
import QuickActions from "./components/QuickActions";
import RecentWarnings from "./components/RecentWarnings";
import StatCard from "./components/StatCard";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    adminApi.get("/analytics").then(res => setData(res.data));
  }, []);

  if (!data) return <p>Loading dashboard…</p>;

  return (
    <div className="space-y-8">
      {/* KPI ROW */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Users" value={data.users} />
        <StatCard label="ATC Supply" value={data.atcSupply} />
        <StatCard label="Burned ATC" value={data.treasury?.totalBurnedATC} />
        <StatCard label="Risk Alerts" value={data.alerts} />
      </div>

      {/* TREASURY */}
      <div className="card">
        <p className="text-sm text-gray-500">Treasury Balance</p>
        <p className="text-2xl font-bold">
          {Number(data.treasury?.balanceATC || 0).toFixed(4)} ATC
        </p>

        <p className="text-sm mt-2 text-red-600">
          Burned: {Number(data.treasury?.totalBurnedATC || 0).toFixed(4)} ATC
        </p>
      </div>

      {/* POOLS */}
      <PoolHealth pools={data.pools} />

      {/* BURN + WARNINGS */}
      <div className="grid grid-cols-2 gap-6">
        <BurnSnapshot data={data.burn} />
        <RecentWarnings warnings={data.warnings} />
      </div>

      {/* QUICK ACTIONS */}
      <QuickActions />
    </div>
  );
}