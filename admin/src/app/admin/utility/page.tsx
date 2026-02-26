"use client";

import adminApi from "@/lib/adminApi";
import { useEffect, useState } from "react";
import RecentUtilityTx from "./components/RecentUtilityTx";
import UtilityBreakdown from "./components/UtilityBreakdown";
import UtilityKPIs from "./components/UtilityKPIs";
import UtilityPoolsTable from "./components/UtilityPoolsTable";

import UtilityRevenueTable from "./components/UtilityRevenueTable";


export default function UtilityAdminPage() {
  const [data, setData] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [pools, setPools] = useState<any[]>([]);

  useEffect(() => {
    adminApi.get("/utility/overview").then(r => setOverview(r.data));
    adminApi.get("/utility/recent").then(r => setRecent(r.data));
    adminApi.get("/utility/pools").then(r => setPools(r.data));
  }, []);

  if (!overview) return <p>Loading utility analytics…</p>;
    useEffect(() => {
    adminApi
      .get("/utilities/dashboard")
      .then(res => setData(res.data));
  }, []);

  if (!data) return <p>Loading utility dashboard…</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Utility Analytics</h1>
      <h1 className="text-2xl font-bold">
        Utility Revenue Dashboard
      </h1>

      <UtilityKPIs overview={overview} />

      <UtilityBreakdown data={overview.breakdown} />

      <UtilityPoolsTable pools={pools} />

      <RecentUtilityTx txs={recent} />
      <UtilityRevenueTable rows={data.byUtility} />
    </div>
  );
}




