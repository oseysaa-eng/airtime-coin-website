"use client";

import { useEffect, useState } from "react";
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

  const load = async () => {
    try {
      const overviewRes = await adminApi.get("/analytics", {
        params: { from, to },
      });

      const burnRes = await adminApi.get("/analytics/burn");

      setOverview(overviewRes.data);
      setBurn(burnRes.data?.burnRate || []);
    } catch (err) {
      console.error("Analytics load error:", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (!overview) {
    return <p className="p-6">Loading analytics...</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics</h1>

        <DateRangeFilter
          from={from}
          to={to}
          onChange={(f, t) => {
            setFrom(f);
            setTo(t);
            load();
          }}
        />
      </div>

      <OverviewCards data={overview} />
      <TrustChart trust={overview.trustDistribution || []} />
      <RunwayWarning pools={burn} />
      <BurnRateTable data={burn} />
    </div>
  );
}