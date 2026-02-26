"use client";

import adminApi from "@/lib/adminApi";
import { useState } from "react";

type GlobalSettings = {
  rewardsPaused: boolean;
  conversionPaused: boolean;
};

export default function GlobalToggles({
  settings,
}: {
  settings: GlobalSettings;
}) {
  const [state, setState] = useState(settings);
  const [saving, setSaving] = useState(false);

  const toggle = async (key: keyof GlobalSettings) => {
    try {
      setSaving(true);

      const updated = {
        ...state,
        [key]: !state[key],
      };

      setState(updated);

      await adminApi.post("/system/global", {
        [key]: updated[key],
      });
    } catch (err) {
      console.error("Failed to update system settings", err);
      // revert on failure
      setState(settings);
      alert("Failed to update system setting");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Global System Toggles</h2>

      <div className="space-y-4">
        {/* Rewards Toggle */}
        <ToggleRow
          label="Pause All Rewards"
          description="Stops CALL, ADS, and SURVEY rewards instantly"
          checked={state.rewardsPaused}
          disabled={saving}
          onChange={() => toggle("rewardsPaused")}
          danger
        />

        {/* Conversion Toggle */}
        <ToggleRow
          label="Pause Minutes → ATC Conversion"
          description="Prevents users from converting airtime minutes"
          checked={state.conversionPaused}
          disabled={saving}
          onChange={() => toggle("conversionPaused")}
        />
      </div>

      {saving && (
        <p className="mt-4 text-sm text-gray-500">
          Saving changes…
        </p>
      )}
    </div>
  );
}

/* ----------------------------------
   Small internal Toggle UI
----------------------------------- */

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled,
  danger,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      <button
        onClick={onChange}
        disabled={disabled}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition
          ${checked ? (danger ? "bg-red-500" : "bg-teal-500") : "bg-gray-300"}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition
            ${checked ? "translate-x-6" : "translate-x-1"}
          `}
        />
      </button>
    </div>
  );
}
