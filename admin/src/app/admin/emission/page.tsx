"use client";

import adminApi from "@/lib/adminApi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EmissionPage() {
  const router = useRouter();
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("adminToken")) {
      router.replace("/admin/login");
      return;
    }

    adminApi.get("/emission").then(res => {
      setState(res.data);
    });
  }, []);

  const halve = async () => {
    if (!confirm("⚠ This will HALVE emissions globally. Continue?")) return;

    setLoading(true);
    const res = await adminApi.post("/emission/halve");
    setState(res.data);
    setLoading(false);
  };

  if (!state) return <p className="p-6">Loading emission state…</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Emission Control</h1>

      <div className="card">
        <p><b>Phase:</b> {state.phase}</p>
        <p><b>Multiplier:</b> {state.multiplier}</p>
        <p>
          <b>Last Halving:</b>{" "}
          {new Date(state.lastHalvingAt).toLocaleString()}
        </p>
      </div>

      <button
        onClick={halve}
        disabled={loading}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Processing…" : "Trigger Halving"}
      </button>

      <p className="text-sm text-gray-500">
        ⚠ Halving immediately affects ALL reward sources (calls, ads, surveys).
      </p>
    </div>
  );
}
