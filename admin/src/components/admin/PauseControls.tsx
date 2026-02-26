"use client";

import adminApi from "@/lib/adminApi";
import { useState } from "react";

type Props = {
  userId: string;
  onDone: () => void;
};

export default function PauseControls({ userId, onDone }: Props) {
  const [loading, setLoading] = useState(false);

  const pause = async (duration: "24h" | "7d" | "permanent") => {
    setLoading(true);
    await adminApi.post(`/users/${userId}/pause`, {
      duration,
      reason: "Admin action",
    });
    setLoading(false);
    onDone();
  };

    const unpause = async () => {
    await adminApi.post(`/users/${userId}/unpause`);
    onDone();
  };

  return (
    <div className="mt-4 space-y-2">
      <h4 className="font-semibold">Pause User</h4>

      <div className="flex gap-2">
        <button
          onClick={() => pause("24h")}
          disabled={loading}
          className="px-3 py-1 text-sm bg-yellow-100 hover:bg-yellow-200 rounded"
        >
          24 Hours
        </button>

        <button
          onClick={() => pause("7d")}
          disabled={loading}
          className="px-3 py-1 text-sm bg-orange-100 hover:bg-orange-200 rounded"
        >
          7 Days
        </button>

        <button
          onClick={() => pause("permanent")}
          disabled={loading}
          className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 rounded"
        >
          Permanent
        </button>

     <button
          onClick={unpause}
          className="px-3 py-1 border rounded"
        >
          Unpause
        </button>


      </div>
    </div>
  );
}