"use client";

import adminApi from "@/lib/adminApi";
import { useState } from "react";

type Props = {
  pool: {
    type: string;
    balanceATC: number;
    dailyLimitATC: number;
    spentTodayATC: number;
    paused: boolean;
  };
  onUpdated: () => void;
};

export default function RewardPoolCard({ pool, onUpdated }: Props) {
  const [fundAmount, setFundAmount] = useState("");

  const togglePause = async () => {
    await adminApi.post(`/system/reward/${pool.type}`, {
      paused: !pool.paused,
    });
    onUpdated();
  };

  const updateLimit = async (value: number) => {
    await adminApi.post(`/system/reward/${pool.type}`, {
      dailyLimitATC: value,
    });
    onUpdated();
  };

  const fundPool = async () => {
    if (!fundAmount) return;
    await adminApi.post(`/system/reward/${pool.type}/fund`, {
      amount: Number(fundAmount),
    });
    setFundAmount("");
    onUpdated();
  };

  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">{pool.type} Rewards</h3>
        <span
          className={`text-sm font-semibold ${
            pool.paused ? "text-red-600" : "text-green-600"
          }`}
        >
          {pool.paused ? "Paused" : "Active"}
        </span>
      </div>

      <div className="text-sm">
        <p>Balance: <b>{pool.balanceATC.toFixed(4)} ATC</b></p>
        <p>Spent Today: {pool.spentTodayATC.toFixed(4)} ATC</p>
      </div>

      <div>
        <label className="text-xs">Daily Limit (ATC)</label>
        <input
          type="number"
          defaultValue={pool.dailyLimitATC}
          className="border w-full p-1 rounded"
          onBlur={e => updateLimit(Number(e.target.value))}
        />
      </div>

      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Fund amount"
          value={fundAmount}
          onChange={e => setFundAmount(e.target.value)}
          className="border p-1 rounded flex-1"
        />
        <button
          onClick={fundPool}
          className="bg-blue-600 text-white px-3 rounded"
        >
          Fund
        </button>
      </div>

      <button
        onClick={togglePause}
        className={`w-full py-1 rounded ${
          pool.paused ? "bg-green-600" : "bg-red-600"
        } text-white`}
      >
        {pool.paused ? "Resume Rewards" : "Pause Rewards"}
      </button>
    </div>
  );
}
