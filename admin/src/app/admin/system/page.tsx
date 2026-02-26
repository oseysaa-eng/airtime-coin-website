"use client";

import adminApi from "@/lib/adminApi";
import { useEffect, useState } from "react";

/* CORE SECTIONS */
import BetaControls from "./components/BetaControls";
import EmergencyPanel from "./components/EmergencyPanel";
import GlobalToggles from "./components/GlobalToggles";
import WarningsPanel from "./components/WarningsPanel";

/* POOLS & ANALYTICS */
import BurnSummary from "./components/BurnSummary";
import PoolCard from "./components/PoolCard";
import PoolControls from "./components/PoolControls";

/* UTILITY */
import PriceControls from "./components/PriceControls";
import UtilityControls from "./components/UtilityControls";
import UtilityFeeControls from "./components/UtilityFeeControls";
import UtilityPoolCard from "./components/UtilityPoolCard";
import UtilityPricingControls from "./components/UtilityPricingControls";
import UtilityRefill from "./components/UtilityRefill";

export default function SystemPage() {
  const [data, setData] = useState<any>(null);
  const [utilityPool, setUtilityPool] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadSystem = async () => {
    const res = await adminApi.get("/system");
    setData(res.data);
  };

  const loadUtility = async () => {
    const res = await adminApi.get("/utility");
    setUtilityPool(res.data);
  };

  useEffect(() => {
    Promise.all([loadSystem(), loadUtility()])
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading system controls…</p>;
  if (!data || !utilityPool) return <p>System data unavailable</p>;

  return (
    <div className="space-y-10">

      {/* HEADER */}
      <header>
        <h1 className="text-2xl font-bold">System Controls</h1>
        <p className="text-sm text-muted-foreground">
          Global configuration, beta access and safety controls
        </p>
      </header>

      {/* WARNINGS / STATUS */}
      <WarningsPanel warnings={data.warnings} />

      {/* 🧪 BETA CONTROLS */}
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold">🧪 Beta Controls</h2>
        <BetaControls beta={data.settings.beta} />
      </section>

      {/* 🚨 EMERGENCY */}
      <section className="card space-y-4 border-red-200">
        <h2 className="text-lg font-semibold text-red-600">
          🚨 Emergency / Incident Mode
        </h2>
        <EmergencyPanel
          active={data.settings.incidentMode.active}
          message={data.settings.incidentMode.message}
        />
      </section>

      {/* ⚙️ GLOBAL TOGGLES */}
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold">⚙️ Global Feature Toggles</h2>
        <GlobalToggles settings={data.settings} />
      </section>

      {/* 💧 REWARD POOLS */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Reward Pool Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {data.pools.map((p: any) => (
            <PoolCard key={p._id} pool={p} />
          ))}
        </div>
        <PoolControls pools={data.pools} />
      </section>

      {/* 🔥 BURN SUMMARY */}
      <BurnSummary summary={data.burn} />

      {/* 🔌 UTILITY SYSTEM */}
      <section className="space-y-6 pt-6 border-t">
        <h2 className="text-lg font-semibold">ATC Utility & Pricing</h2>

        <UtilityPoolCard pool={utilityPool} />

        <UtilityControls pool={utilityPool} onUpdated={loadUtility} />
        <UtilityRefill onRefilled={loadUtility} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UtilityFeeControls fees={data.settings.utilityFees} />
          <UtilityPricingControls />
        </div>

        <PriceControls />
      </section>
    </div>
  );
}