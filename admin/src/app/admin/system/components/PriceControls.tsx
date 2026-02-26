"use client";

import adminApi from "@/lib/adminApi";
import { useEffect, useState } from "react";

export default function PriceControls() {
  const [price, setPrice] = useState<any>(null);
  const [manual, setManual] = useState("");

  const load = async () => {
    const res = await adminApi.get("/price");
    setPrice(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  if (!price) return null;

  const setMode = async (mode: string) => {
    await adminApi.post("/price/mode", { mode });
    load();
  };

  const setManualPrice = async () => {
    await adminApi.post("/price/manual", {
      price: Number(manual),
    });
    setManual("");
    load();
  };

  return (
    <div className="card space-y-4">
      <h2 className="font-semibold text-lg">
        ATC Pricing Engine
      </h2>

      <div className="text-sm">
        <div>
          <b>Current Price:</b>{" "}
          {price.currentPrice?.toFixed(6)} ATC
        </div>

        <div>
          <b>Mode:</b>{" "}
          <span className="font-bold">
            {price.mode}
          </span>
        </div>

        <div>
          <b>Trend:</b>{" "}
          {price.trend} ({price.changePercent?.toFixed(2)}%)
        </div>
      </div>

      {/* MODE BUTTONS */}
      <div className="flex gap-2">
        {["AUTO", "MANUAL", "FROZEN"].map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1 rounded text-sm border ${
              price.mode === m
                ? "bg-black text-white"
                : "bg-white"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* MANUAL */}
      <div className="space-y-2">
        <input
          placeholder="Manual price"
          value={manual}
          onChange={e => setManual(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />

        <button
          onClick={setManualPrice}
          className="bg-teal-600 text-white px-4 py-2 rounded w-full"
        >
          Set Manual Price
        </button>
      </div>
    </div>
  );
}