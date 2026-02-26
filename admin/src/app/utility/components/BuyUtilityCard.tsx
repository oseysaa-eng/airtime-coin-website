"use client";

import adminApi from "@/lib/adminApi";
import { useState } from "react";

type Props = {
  wallet: any;
  pool: any;
  onSuccess: (data: any) => void;
};

export default function AirtimeConvertCard({
  wallet,
  pool,
  onSuccess,
}: Props) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const rate = pool.rate ?? 1;

  const airtimeValue =
    Number(amount || 0) * rate;

  const submit = async () => {
    if (!amount || Number(amount) <= 0) return;

    setLoading(true);
    try {
      const res = await adminApi.post(
        "/utility/airtime",
        { amountATC: Number(amount) }
      );
      onSuccess(res.data);
      setAmount("");
    } catch (err: any) {
      alert(
        err?.response?.data?.message ||
          "Conversion failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card space-y-4">
      <div className="text-sm text-gray-500">
        Balance:{" "}
        <strong>
          {wallet.balanceATC.toFixed(4)} ATC
        </strong>
      </div>

      <div>
        <label className="text-sm block mb-1">
          ATC Amount
        </label>
        <input
          type="number"
          value={amount}
          min={0}
          step="0.01"
          onChange={e => setAmount(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="text-sm text-gray-600">
        You will receive{" "}
        <strong>
          {airtimeValue.toFixed(2)} GHS
        </strong>{" "}
        airtime
      </div>

      <button
        onClick={submit}
        disabled={
          loading ||
          pool.paused ||
          Number(amount) > wallet.balanceATC
        }
        className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
      >
        {loading ? "Processing…" : "Buy Airtime"}
      </button>
    </div>
  );
}