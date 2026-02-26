"use client";

import adminApi from "@/lib/adminApi";
import { useEffect, useState } from "react";
import BuyUtilityCard from "./components/BuyUtilityCard";
import ConversionSuccess from "./components/ConversionSuccess";
import UtilityBreakdown from "./components/UtilityBreakdown";
import UtilityRecent from "./components/UtilityRecent";
import UtilityStats from "./components/UtilityStats";
import UtilityStatusBanner from "./components/UtilityStatusBanner";


export default function UtilityPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [pool, setPool] = useState<any>(null);
  const [success, setSuccess] = useState<any>(null);
   const [overview, setOverview] = useState<any>(null);
  const [breakdown, setBreakdown] = useState([]);
  const [recent, setRecent] = useState([]);

  const load = async () => {
    const [w, p] = await Promise.all([
      adminApi.get("/wallet"),
      adminApi.get("/utility"),
    ]);

    setWallet(w.data);
    setPool(p.data);
  };

  useEffect(() => {
    load();
  }, []);

    useEffect(() => {
    adminApi.get("/utility/overview").then(r => setOverview(r.data));
    adminApi.get("/utility/breakdown").then(r => setBreakdown(r.data));
    adminApi.get("/utility/recent").then(r => setRecent(r.data));
  }, []);

  if (!overview) return <p>Loading utility analytics…</p>;

  if (!wallet || !pool) return <p className="p-6">Loading utility…</p>;

  return (
    <div className="p-6 space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">Buy Airtime with ATC</h1>

      <UtilityStatusBanner pool={pool} />
        <UtilityStats data={overview} />

      <UtilityBreakdown rows={breakdown} />

      <UtilityRecent rows={recent} />

      <BuyUtilityCard
        wallet={wallet}
        pool={pool}
        onSuccess={data => {
          setSuccess(data);
          load();
        }}
      />

      {success && (
        <ConversionSuccess data={success} />
      )}
    </div>

  );
}