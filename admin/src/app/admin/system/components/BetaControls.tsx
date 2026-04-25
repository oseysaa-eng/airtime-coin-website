"use client";

import { useState } from "react";
import adminApi from "@/lib/adminApi";

type BetaSettings = {
  active: boolean;
  showWithdrawals: boolean;
  showConversion: boolean;
  showAds: boolean;
  maxUsers?: number;
  dailyAdLimit?: number;
  dailyMinutesCap?: number;
};

type Props = {
  beta: BetaSettings;
};

export default function BetaControls({ beta }: Props) {
  const [data, setData] = useState<BetaSettings>(beta);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    try {
      setSaving(true);

      await adminApi.post("/admin/beta", data);

      alert("Beta settings updated");
    } catch (err) {
      console.error(err);
      alert("Failed to update beta settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">

      {/* BETA MODE */}
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={data.active}
          onChange={(e) =>
            setData({ ...data, active: e.target.checked })
          }
        />
        Enable Beta Mode
      </label>

      {/* WITHDRAWALS */}
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={data.showWithdrawals}
          onChange={(e) =>
            setData({ ...data, showWithdrawals: e.target.checked })
          }
        />
        Enable Withdrawals
      </label>

      {/* CONVERSION */}
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={data.showConversion}
          onChange={(e) =>
            setData({ ...data, showConversion: e.target.checked })
          }
        />
        Enable Conversion
      </label>

      {/* ADS */}
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={data.showAds}
          onChange={(e) =>
            setData({ ...data, showAds: e.target.checked })
          }
        />
        Enable Ads
      </label>

      {/* MAX USERS */}
      <div>
        <label className="block text-sm">Max Users</label>
        <input
          type="number"
          value={data.maxUsers || ""}
          onChange={(e) =>
            setData({
              ...data,
              maxUsers: Number(e.target.value),
            })
          }
          className="border px-2 py-1 rounded w-full"
        />
      </div>

      {/* DAILY MINUTES CAP */}
      <div>
        <label className="block text-sm">Daily Minutes Cap</label>
        <input
          type="number"
          value={data.dailyMinutesCap || ""}
          onChange={(e) =>
            setData({
              ...data,
              dailyMinutesCap: Number(e.target.value),
            })
          }
          className="border px-2 py-1 rounded w-full"
        />
      </div>

      {/* SAVE */}
      <button
        onClick={save}
        disabled={saving}
        className="bg-black text-white px-4 py-2 rounded"
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>

    </div>
  );
}