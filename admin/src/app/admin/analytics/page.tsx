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

import ProfitCard from "@/components/admin/ProfitCard";
import ProfitChart from "@/components/admin/ProfitChart";
import ProfitBreakdown from "@/components/admin/ProfitBreakdown";

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<any>(null);
  const [burn, setBurn] = useState<any[]>([]);
  const [trend, setTrend] = useState<any[]>([]);
  const [fraud, setFraud] = useState<any[]>([]);

  const [profit, setProfit] = useState<any>(null);
  const [profitTrend, setProfitTrend] = useState<any[]>([]);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState<any>(null);

  /* ================= LOAD DATA ================= */
  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        overviewRes,
        burnRes,
        trendRes,
        fraudRes,
        profitRes,
        profitTrendRes,
      ] = await Promise.all([
        adminApi.get("/analytics"),
        adminApi.get("/analytics/burn"),
        adminApi.get("/analytics/call-trend"),
        adminApi.get("/analytics/fraud-heatmap"),
        adminApi.get("/analytics/profit"),
        adminApi.get("/analytics/profit-trend"),
      ]);

      setOverview(overviewRes.data);
      setBurn(burnRes.data?.burnRate || []);
      setTrend(trendRes.data || []);
      setFraud(fraudRes.data || []);
      setProfit(profitRes.data);
      setProfitTrend(profitTrendRes.data?.trend || []);

    } catch (err) {
      console.error("Analytics load error:", err);
      setError("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* ================= SOCKET ================= */
  useEffect(() => {
    const socket = connectAdminSocket();
    if (!socket) return;

    socket.on("ADMIN_ANALYTICS_UPDATE", (data: any) => {
      // 🔥 ONLY update what changed

      if (data.type === "PROFIT_UPDATE") {
        setProfit((prev: any) => ({
          ...(prev || {}),
          totalProfitATC:
            (prev?.totalProfitATC || 0) + data.amount,
          dailyProfitATC:
            (prev?.dailyProfitATC || 0) + data.amount,
        }));
      }

      if (data.type === "CALL_UPDATE") {
        setOverview((prev: any) => ({
          ...(prev || {}),
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
      }
    });

    socket.on("FRAUD_ALERT", (data: any) => {
      setAlert(data);
      setTimeout(() => setAlert(null), 5000);
    });

    return () => {
      socket.off("ADMIN_ANALYTICS_UPDATE");
      socket.off("FRAUD_ALERT");
    };
  }, []);

  /* ================= FILTER ================= */
  const handleFilterChange = async (f: string, t: string) => {
    setFrom(f);
    setTo(t);

    try {
      const res = await adminApi.get("/analytics", {
        params: { from: f, to: t },
      });

      setOverview(res.data);
    } catch {
      console.log("Filter error");
    }
  };

  /* ================= UI STATES ================= */
  if (loading && !overview) {
    return <p className="p-6">Loading analytics...</p>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  /* ================= UI ================= */
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

      {/* ================= TOP GRID ================= */}
      <div className="grid md:grid-cols-2 gap-6">
        <ProfitCard />
        <OverviewCards data={overview} />
      </div>

      {/* ================= PROFIT SECTION ================= */}
      <div className="grid md:grid-cols-2 gap-6">
        <ProfitBreakdown data={profit} />
        <ProfitChart data={profitTrend} />
      </div>

      {/* FRAUD ALERT */}
      <FraudAlert alert={alert} />

      {/* ================= CHARTS ================= */}
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