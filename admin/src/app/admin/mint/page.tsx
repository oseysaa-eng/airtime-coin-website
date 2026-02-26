"use client";

import adminApi from "@/lib/adminApi";
import { useEffect, useState } from "react";

export default function MintPage() {
  const [status, setStatus] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const load = async () => {
    const res = await adminApi.get("/mint/status");
    setStatus(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const mint = async () => {
    await adminApi.post("/mint", {
      amount: Number(amount),
      reason,
      target: "reward_pool",
    });
    setAmount("");
    setReason("");
    load();
  };

  const togglePause = async () => {
    await adminApi.patch("/mint/pause", {
      paused: !status.mintPaused,
    });
    load();
  };

  if (!status) return <div>Loading…</div>;

  return (
    <div className="p-6 space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">Mint Control</h1>

      <div className="border p-4 rounded">
        <p>Total Minted: <b>{status.totalMinted} ATC</b></p>
        <p>Max Supply: {status.maxSupply}</p>
        <p>Status: {status.mintPaused ? "⛔ Paused" : "✅ Active"}</p>
      </div>

      <button
        className="px-4 py-2 bg-red-600 text-white rounded"
        onClick={togglePause}
      >
        {status.mintPaused ? "Resume Minting" : "Pause Minting"}
      </button>

      <div className="border p-4 rounded space-y-3">
        <h2 className="font-semibold">Mint ATC</h2>

        <input
          placeholder="Amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="border p-2 w-full"
        />

        <input
          placeholder="Reason"
          value={reason}
          onChange={e => setReason(e.target.value)}
          className="border p-2 w-full"
        />

        <button
          onClick={mint}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Mint
        </button>
      </div>
    </div>
  );
}
