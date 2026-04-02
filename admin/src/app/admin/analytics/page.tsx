"use client";

import { useEffect, useState, useCallback } from "react";
import adminApi from "@/lib/adminApi";

import OverviewCards from "./components/OverviewCards";
import TrustChart from "./components/TrustChart";
import RunwayWarning from "@/components/RunwayWarning";
import BurnRateTable from "./components/BurnRateTable";
import DateRangeFilter from "./components/DateRangeFilter";
import CallTrendChart from "./components/CallTrendChart";
import FraudHeatmap from "./components/FraudHeatmap";
import FraudAlert from "./components/FraudAlert";

import { connectAdminSocket } from "@/lib/adminSocket";

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<any>(null);
  const [burn, setBurn] = useState<any[]>([]);
  const [trend, setTrend] = useState<any[]>([]);
  const [fraud, setFraud] = useState<any[]>([]);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [alert, setAlert] = useState<any>(null);

  /* ================================
     LOAD INITIAL DATA (ONCE)
  ================================= */
  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [overviewRes, burnRes, trendRes, fraudRes] = await Promise.all([
        adminApi.get("/analytics"),
        adminApi.get("/analytics/burn"),
        adminApi.get("/analytics/call-trend"),
        adminApi.get("/analytics/fraud-heatmap"),
      ]);

      setOverview(overviewRes.data);
      setBurn(burnRes.data?.burnRate || []);
      setTrend(trendRes.data || []);
      setFraud(fraudRes.data || []);

    } catch (err: any) {
      console.error("Analytics load error:", err);
      setError("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, []);

  /* ================================
     SOCKET LIVE UPDATES
  ================================= */
  useEffect(() => {
    const socket = connectAdminSocket();
    if (!socket) return;

    /* LIVE ANALYTICS */
    socket.on("ADMIN_ANALYTICS_UPDATE", (data: any) => {
      console.log("📡 Live update:", data);

      setOverview((prev: any) => ({
        ...prev,
        calls: (prev?.calls || 0) + 1,
        minutes: (prev?.minutes || 0) + (data.minutes || 0),
      }));

      setTrend((prev: any[]) => [
        ...prev.slice(-15),
        {
          date: new Date().toLocaleTimeString(),
          calls: 1,
        },
      ]);
    });

    /* FRAUD ALERT */
    socket.on("FRAUD_ALERT", (data: any) => {
      console.log("🚨 Fraud alert:", data);

      setAlert(data);

      setTimeout(() => {
        setAlert(null);
      }, 5000);
    });

    return () => {
      socket.off("ADMIN_ANALYTICS_UPDATE");
      socket.off("FRAUD_ALERT");
    };
  }, []);

  /* ================================
     FILTER HANDLER
  ================================= */
  const handleFilterChange = async (f: string, t: string) => {
    setFrom(f);
    setTo(t);

    try {
      const res = await adminApi.get("/analytics", {
        params: { from: f, to: t },
      });

      setOverview(res.data);
    } catch (err) {
      console.log("Filter error");
    }
  };

  /* ================================
     UI STATES
  ================================= */
  if (loading && !overview) {
    return <p className="p-6">Loading analytics...</p>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  /* ================================
     MAIN UI
  ================================= */
  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics</h1>

        <DateRangeFilter
          from={from}
          to={to}
          onChange={handleFilterChange}
        />
      </div>

      {/* FRAUD ALERT */}
      <FraudAlert alert={alert} />

      {/* KPI */}
      <OverviewCards data={overview} />

      {/* CHARTS */}
      <div className="grid grid-cols-2 gap-6">
        <TrustChart trust={overview?.trustDistribution || []} />
        <CallTrendChart data={trend} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <FraudHeatmap data={fraud} />
        <BurnRateTable data={burn} />
      </div>

      {/* WARNING */}
      <RunwayWarning pools={burn} />

    </div>
  );
}