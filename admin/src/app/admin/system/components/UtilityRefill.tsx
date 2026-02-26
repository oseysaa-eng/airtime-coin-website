"use client";

import adminApi from "@/lib/adminApi";
import { useState } from "react";

type Props = {
  onRefilled: () => void;
};

export default function UtilityRefill({ onRefilled }: Props) {
  const [utility, setUtility] = useState("AIRTIME");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const refill = async () => {
    if (!amount) return;

    setLoading(true);
    await adminApi.post("/system/utility/refill", {
      utility,
      amountATC: Number(amount),
    });
    setAmount("");
    setLoading(false);
    onRefilled();
  };

  return (
    <div className="border rounded-lg p-4 bg-white">
      <h4 className="font-semibold mb-3">Refill Utility Pool</h4>

      <div className="flex gap-3">
        <select
          value={utility}
          onChange={e => setUtility(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="AIRTIME">Airtime</option>
          <option value="DATA">Data</option>
          <option value="DSTV">DSTV</option>
        </select>

        <input
          type="number"
          placeholder="ATC amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="border rounded px-2 py-1"
        />

        <button
          onClick={refill}
          disabled={loading}
          className="bg-teal-600 text-white px-4 rounded"
        >
          {loading ? "Refilling…" : "Refill"}
        </button>
      </div>
    </div>
  );
}