"use client";

import adminApi from "@/lib/adminApi";
import clsx from "clsx";
import { useEffect, useState } from "react";

import FraudIndicators from "@/components/admin/FraudIndicators";
import FraudTimeline from "@/components/admin/FraudTimeline";
import PauseControls from "@/components/admin/PauseControls";
import TrustSuggestion from "@/components/admin/TrustSuggestion";

type Props = {
  user: any;
  onClose: () => void;
  onUpdated: () => void;
};

export default function UserDrawer({ user, onClose, onUpdated }: Props) {
  const [trust, setTrust] = useState<number>(user?.trustScore ?? 100);
  const [saving, setSaving] = useState(false);
  const [timeline, setTimeline] = useState<any[]>([]);

  // Sync trust when user changes
  useEffect(() => {
    if (user) setTrust(user.trustScore ?? 100);
  }, [user]);

  // Load fraud timeline
  useEffect(() => {
    if (!user?._id) return;

    adminApi
      .get(`/users/${user._id}/fraud-timeline`)
      .then(res => setTimeline(res.data))
      .catch(() => setTimeline([]));
  }, [user?._id]);

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!user) return null;

  const isPaused =
    user.pausedUntil && new Date(user.pausedUntil) > new Date();

  const trustLabel =
    trust < 40 ? "BLOCKED" :
    trust < 60 ? "LIMITED" :
    trust < 80 ? "REDUCED" :
    "GOOD";

  const trustColor =
    trust < 40 ? "bg-red-600" :
    trust < 60 ? "bg-orange-500" :
    trust < 80 ? "bg-yellow-500" :
    "bg-green-600";

  const saveTrust = async () => {
    setSaving(true);
    try {
      await adminApi.post("/users/bulk", {
        userIds: [user._id],
        action: "SET_TRUST",
        value: trust,
        reason: "Manual admin adjustment",
      });

      onUpdated();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40" onClick={onClose} />

      {/* Drawer */}
      <div className="w-[420px] bg-white p-6 shadow-xl overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">User Details</h2>

        {/* BASIC INFO */}
        <div className="space-y-2 text-sm">
          <div><b>Email:</b> {user.email}</div>
          <div><b>KYC:</b> {user.kycStatus}</div>
          <div>
            <b>Status:</b>{" "}
            <span className={isPaused ? "text-red-600" : "text-green-600"}>
              {isPaused ? "Paused" : "Active"}
            </span>
          </div>
        </div>

        {/* TRUST CONTROL */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Trust Score</h3>
            <span
              className={clsx(
                "px-3 py-1 rounded-full text-white text-xs",
                trustColor
              )}
            >
              {trustLabel}
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={100}
            value={trust}
            disabled={isPaused}
            onChange={e => setTrust(Number(e.target.value))}
            className="w-full"
          />

          <div className="flex justify-between text-xs text-zinc-500 mt-1">
            <span>0</span>
            <span>100</span>
          </div>

          {/* PRESETS */}
          <div className="flex gap-2 mt-4">
            {[40, 60, 80, 100].map(v => (
              <button
                key={v}
                onClick={() => setTrust(v)}
                disabled={isPaused}
                className="px-3 py-1 text-xs border rounded hover:bg-zinc-100 disabled:opacity-50"
              >
                {v}
              </button>
            ))}
          </div>

          {/* FRAUD + CONTROLS */}
          <div className="mt-8 space-y-6">
            <FraudIndicators user={user} />
            <TrustSuggestion user={user} />
            <FraudTimeline events={timeline} />
            <PauseControls userId={user._id} onDone={onUpdated} />
          </div>

          {/* SAVE */}
          <button
            onClick={saveTrust}
            disabled={saving || isPaused}
            className="mt-6 w-full bg-black text-white py-2 rounded hover:bg-zinc-800 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Trust"}
          </button>
        </div>
      </div>
    </div>
  );
}