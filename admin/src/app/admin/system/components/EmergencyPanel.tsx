"use client";

import adminApi from "@/lib/adminApi";
import { useState } from "react";

export default function EmergencyPanel({
  active,
  message,
}: any) {
  const [enabled, setEnabled] = useState(active);
  const [text, setText] = useState(message || "");

  const toggle = async () => {
    await adminApi.post("/system/emergency", {
      active: !enabled,
      message: text,
    });
    setEnabled(!enabled);
  };

  return (
    <div className="border-2 border-red-500 bg-red-50 p-4 rounded-lg">
      <h3 className="text-red-700 font-bold">
        🚨 Incident Mode
      </h3>

      <p className="text-sm text-red-600 mb-3">
        Freezes rewards & conversions immediately
      </p>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Public incident message"
        className="w-full p-2 border rounded mb-3"
      />

      <button
        onClick={toggle}
        className={`px-4 py-2 rounded text-white ${
          enabled
            ? "bg-red-700"
            : "bg-red-500"
        }`}
      >
        {enabled
          ? "Disable Incident Mode"
          : "Activate Incident Mode"}
      </button>
    </div>
  );
}