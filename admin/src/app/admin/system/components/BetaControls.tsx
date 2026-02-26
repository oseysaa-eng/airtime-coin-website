"use client";

import adminApi from "@/lib/adminApi";
import { useEffect, useState } from "react";

type BetaSettings = {
  active: boolean;
  maxUsers: number;
  showConversion: boolean;
  showWithdrawals: boolean;
};

type IncidentMode = {
  active: boolean;
  message?: string;
  activatedAt?: string;
};

type InviteCode = {
  _id: string;
  code: string;
  expiresAt: string;
};

export default function BetaControls() {
  const [beta, setBeta] = useState<BetaSettings | null>(null);
  const [incident, setIncident] = useState<IncidentMode | null>(null);
  const [codes, setCodes] = useState<InviteCode[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await adminApi.get("/beta");
      setBeta(res.data.beta);
      setIncident(res.data.incidentMode);
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateBeta = async (changes: Partial<BetaSettings>) => {
    if (!beta) return;

    try {
      setSaving(true);

      const res = await adminApi.post("/beta", {
        ...beta,
        ...changes,
      });

      setBeta(res.data.beta);
    } catch (err) {
      console.error("Update error:", err);
    } finally {
      setSaving(false);
    }
  };

  const toggleEmergency = async () => {
    if (!incident) return;

    try {
      await adminApi.post("/beta/emergency", {
        active: !incident.active,
        message: "Admin triggered",
      });

      await load();
    } catch (err) {
      console.error("Emergency error:", err);
    }
  };

  const generateCodes = async () => {
    try {
      setGenerating(true);

      const res = await adminApi.post(
        "/beta/invites/generate",
        { count: 5 }
      );

      setCodes(res.data.codes);
    } catch (err) {
      console.error("Generate error:", err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading || !beta || !incident) {
    return (
      <div className="p-6 text-gray-500">
        Loading beta controls…
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-4xl">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          🧪 Beta Management
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Control access, feature visibility, and private invites.
        </p>
      </div>

      {/* ───────────────────── BETA SETTINGS ───────────────────── */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border space-y-6">

        <h2 className="text-lg font-semibold">
          Beta Configuration
        </h2>

        <SwitchRow
          label="Beta Mode Active"
          description="Enable or disable beta access."
          value={beta.active}
          onChange={(v) => updateBeta({ active: v })}
        />

        <div>
          <label className="block text-sm font-medium mb-2">
            Maximum Beta Users
          </label>
          <input
            type="number"
            className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            value={beta.maxUsers}
            onChange={(e) =>
              updateBeta({
                maxUsers: Number(e.target.value),
              })
            }
          />
        </div>

        <SwitchRow
          label="Enable Conversion"
          description="Allow users to convert minutes to ATC."
          value={beta.showConversion}
          onChange={(v) =>
            updateBeta({ showConversion: v })
          }
        />

        <SwitchRow
          label="Enable Withdrawals"
          description="Allow ATC withdrawals."
          value={beta.showWithdrawals}
          onChange={(v) =>
            updateBeta({ showWithdrawals: v })
          }
        />

        {saving && (
          <p className="text-xs text-gray-400">
            Saving changes…
          </p>
        )}
      </section>

      {/* ───────────────────── INVITE CODES ───────────────────── */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border space-y-6">

        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            Invite Codes
          </h2>

          <button
            onClick={generateCodes}
            disabled={generating}
            className="px-5 py-2 bg-black text-white rounded-xl hover:opacity-90 transition"
          >
            {generating
              ? "Generating..."
              : "Generate 5 Codes"}
          </button>
        </div>

        {codes.length > 0 && (
          <div className="grid gap-3">
            {codes.map((c) => (
              <div
                key={c._id}
                className="flex justify-between items-center bg-gray-50 border rounded-xl px-4 py-3"
              >
                <span className="font-mono text-sm">
                  {c.code}
                </span>

                <span className="text-xs text-gray-500">
                  Expires{" "}
                  {new Date(
                    c.expiresAt
                  ).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ───────────────────── EMERGENCY ───────────────────── */}
      <section className="bg-red-50 border border-red-200 p-6 rounded-2xl space-y-4">

        <h2 className="text-red-600 font-semibold text-lg">
          🚨 Emergency Mode
        </h2>

        <button
          onClick={toggleEmergency}
          className="px-5 py-2 bg-red-600 text-white rounded-xl hover:opacity-90 transition"
        >
          {incident.active
            ? "Disable Emergency"
            : "Enable Emergency"}
        </button>

        {incident.active && incident.activatedAt && (
          <p className="text-xs text-red-500">
            Active since{" "}
            {new Date(
              incident.activatedAt
            ).toLocaleString()}
          </p>
        )}
      </section>
    </div>
  );
}

/* ───────────────── SWITCH COMPONENT ───────────────── */
function SwitchRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-xs text-gray-500">
          {description}
        </p>
      </div>

      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
          value ? "bg-black" : "bg-gray-300"
        }`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full shadow-md transform transition ${
            value ? "translate-x-6" : ""
          }`}
        />
      </button>
    </div>
  );
}