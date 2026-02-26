"use client";

import adminApi from "@/lib/adminApi";
import clsx from "clsx";
import { useState } from "react";

type Pool = {
  type: string;
  balanceATC: number;
  dailyLimitATC: number;
  paused: boolean;
};

export default function PoolControls({ pools }: { pools: Pool[] }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Pool Controls</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pools.map(pool => (
          <PoolControlCard key={pool.type} pool={pool} />
        ))}
      </div>
    </section>
  );
}

/* ----------------------------------
   Individual Pool Control
----------------------------------- */

function PoolControlCard({ pool }: { pool: Pool }) {
  const [dailyLimit, setDailyLimit] = useState(pool.dailyLimitATC);
  const [topup, setTopup] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const updatePool = async (payload: any) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await adminApi.post(`/system/reward/${pool.type}`, payload);
      setSuccess("Pool updated");
    } catch (e: any) {
      setError(e?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const fundPool = async () => {
    if (!topup || Number(topup) <= 0) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await adminApi.post(`/system/reward/${pool.type}/fund`, {
        amount: Number(topup),
      });

      setTopup("");
      setSuccess("Pool funded");
    } catch (e: any) {
      setError(e?.response?.data?.message || "Funding failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {pool.type} Pool
        </h3>

        <span
          className={clsx(
            "text-xs px-2 py-1 rounded-full font-medium",
            pool.paused
              ? "bg-red-100 text-red-700"
              : "bg-teal-100 text-teal-700"
          )}
        >
          {pool.paused ? "Paused" : "Active"}
        </span>
      </div>

      {/* Daily Limit */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">
          Daily Limit (ATC)
        </label>
        <input
          type="number"
          value={dailyLimit}
          onChange={e => setDailyLimit(Number(e.target.value))}
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
        <button
          disabled={loading}
          onClick={() =>
            updatePool({ dailyLimitATC: dailyLimit })
          }
          className="mt-2 text-sm text-teal-600 hover:underline disabled:opacity-50"
        >
          Update Limit
        </button>
      </div>

      {/* Pause Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">
          Pause Pool
        </span>
        <button
          disabled={loading}
          onClick={() =>
            updatePool({ paused: !pool.paused })
          }
          className={clsx(
            "px-3 py-1 rounded text-sm font-medium",
            pool.paused
              ? "bg-teal-600 text-white"
              : "bg-red-600 text-white"
          )}
        >
          {pool.paused ? "Resume" : "Pause"}
        </button>
      </div>

      {/* Fund Pool */}
      <div>
        <label className="block text-sm text-gray-600 mb-1">
          Fund Pool (ATC)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={topup}
            onChange={e => setTopup(e.target.value)}
            className="flex-1 rounded-md border px-3 py-2 text-sm"
            placeholder="Amount"
          />
          <button
            disabled={loading}
            onClick={fundPool}
            className="rounded-md bg-black text-white px-4 text-sm disabled:opacity-50"
          >
            Fund
          </button>
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {success && (
        <p className="text-sm text-teal-600">{success}</p>
      )}
    </div>
  );
}
