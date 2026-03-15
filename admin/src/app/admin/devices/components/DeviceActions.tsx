"use client";

import { useState } from "react";
import adminApi from "@/lib/adminApi";

export default function DeviceActions({
  deviceId,
  reload,
}: {
  deviceId: string;
  reload: () => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  const runAction = async (action: "trust" | "flag" | "block") => {
    try {
      if (action === "block") {
        const ok = confirm("Are you sure you want to block this device?");
        if (!ok) return;
      }

      setLoading(action);

      await adminApi.post(`/devices/${deviceId}/${action}`);

      reload();
    } catch (err) {
      console.error(`Device ${action} failed`, err);
      alert("Operation failed. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex gap-2">

      <button
        disabled={loading !== null}
        onClick={() => runAction("trust")}
        className="px-2 py-1 text-xs bg-green-600 text-white rounded disabled:opacity-50"
      >
        {loading === "trust" ? "..." : "Trust"}
      </button>

      <button
        disabled={loading !== null}
        onClick={() => runAction("flag")}
        className="px-2 py-1 text-xs bg-orange-500 text-white rounded disabled:opacity-50"
      >
        {loading === "flag" ? "..." : "Flag"}
      </button>

      <button
        disabled={loading !== null}
        onClick={() => runAction("block")}
        className="px-2 py-1 text-xs bg-red-600 text-white rounded disabled:opacity-50"
      >
        {loading === "block" ? "..." : "Block"}
      </button>

    </div>
  );
}