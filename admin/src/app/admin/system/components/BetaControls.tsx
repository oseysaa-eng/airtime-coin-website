"use client";

import { useState } from "react";
import adminApi from "@/lib/adminApi";

type BetaSettings = {
  enabled: boolean;
  allowNewUsers: boolean;
  allowWithdrawals: boolean;
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

      await adminApi.put("/system/beta", data);

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

      {/* ENABLE BETA */}
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={data.enabled}
          onChange={(e) =>
            setData({
              ...data,
              enabled: e.target.checked,
            })
          }
        />
        Enable Beta Mode
      </label>

      {/* NEW USERS */}
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={data.allowNewUsers}
          onChange={(e) =>
            setData({
              ...data,
              allowNewUsers: e.target.checked,
            })
          }
        />
        Allow New Users
      </label>

      {/* WITHDRAWALS */}
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={data.allowWithdrawals}
          onChange={(e) =>
            setData({
              ...data,
              allowWithdrawals: e.target.checked,
            })
          }
        />
        Allow Withdrawals
      </label>

      {/* SAVE BUTTON */}
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