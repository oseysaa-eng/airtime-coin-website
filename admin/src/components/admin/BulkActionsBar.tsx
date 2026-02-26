"use client";

import adminApi from "@/lib/adminApi";
import { useState } from "react";

type Props = {
  selected: string[];
  onDone: () => void;
};

export default function BulkActionsBar({ selected, onDone }: Props) {
  const [loading, setLoading] = useState(false);
  const [trust, setTrust] = useState(60);

  if (selected.length === 0) return null;

  const run = async (payload: any) => {
    setLoading(true);
    await adminApi.post("/users/bulk", {
      userIds: selected,
      ...payload,
    });
    setLoading(false);
    onDone();
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-4 rounded-xl shadow-lg flex gap-3 items-center z-50">
      <span className="text-sm">
        {selected.length} selected
      </span>

      <button
        onClick={() => run({ action: "PAUSE", duration: "24h" })}
        className="px-3 py-1 text-xs bg-red-600 rounded"
      >
        Pause 24h
      </button>

      <button
        onClick={() => run({ action: "PAUSE", duration: "7d" })}
        className="px-3 py-1 text-xs bg-red-700 rounded"
      >
        Pause 7d
      </button>

      <button
        onClick={() => run({ action: "RESUME" })}
        className="px-3 py-1 text-xs bg-green-600 rounded"
      >
        Resume
      </button>

      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          max={100}
          value={trust}
          onChange={e => setTrust(Number(e.target.value))}
          className="w-14 text-black text-xs px-1 rounded"
        />
        <button
          onClick={() =>
            run({ action: "SET_TRUST", value: trust })
          }
          className="px-2 py-1 text-xs bg-blue-600 rounded"
        >
          Set Trust
        </button>
      </div>

      {loading && <span className="text-xs">Applying…</span>}
    </div>
  );
}