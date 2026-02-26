"use client";

import adminApi from "@/lib/adminApi";
import { useState } from "react";

type Props = {
  pool: any;
  onUpdated: () => void;
};

export default function UtilityControls({ pool, onUpdated }: Props) {
  const [rate, setRate] = useState(pool.rate);
  const [dailyLimit, setDailyLimit] = useState(pool.dailyLimitATC);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await adminApi.post(`/system/utility/${pool.utility}`, {
      rate,
      dailyLimitATC: dailyLimit,
    });
    setSaving(false);
    onUpdated();
  };

  const togglePause = async () => {
    await adminApi.post(`/system/utility/${pool.utility}/pause`, {
      paused: !pool.paused,
    });
    onUpdated();
  };

  return (
    <div className="border rounded-lg p-4 bg-zinc-50 space-y-4">
      <h4 className="font-semibold">Controls — {pool.utility}</h4>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <label className="block mb-1">ATC → Utility Rate</label>
          <input
            type="number"
            value={rate}
            onChange={e => setRate(Number(e.target.value))}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="block mb-1">Daily Limit (ATC)</label>
          <input
            type="number"
            value={dailyLimit}
            onChange={e => setDailyLimit(Number(e.target.value))}
            className="w-full border rounded px-2 py-1"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="px-4 py-2 bg-black text-white rounded"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>

        <button
          onClick={togglePause}
          className={`px-4 py-2 rounded ${
            pool.paused
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {pool.paused ? "Resume Utility" : "Pause Utility"}
        </button>
      </div>
    </div>
  );
}