"use client";

import adminApi from "@/lib/adminApi";
import { useEffect, useState } from "react";

type Fees = {
  burnPercent: number;
  treasuryPercent: number;
};

export default function UtilityFeeControls({
  fees,
}: {
  fees?: Fees;
}) {
  // ✅ SAFE DEFAULTS
  const [burn, setBurn] = useState(0);
  const [treasury, setTreasury] = useState(0);

  // 🔄 sync when backend loads
  useEffect(() => {
    if (fees) {
      setBurn(fees.burnPercent ?? 0);
      setTreasury(fees.treasuryPercent ?? 0);
    }
  }, [fees]);

  const remaining = Math.max(0, 100 - burn - treasury);

  const save = async () => {
    if (burn + treasury > 100) {
      alert("Burn + Treasury cannot exceed 100%");
      return;
    }

    await adminApi.post("/system/utility-fees", {
      burnPercent: burn,
      treasuryPercent: treasury,
    });

    alert("Utility fee settings updated");
  };

  return (
    <div className="card space-y-4">
      <h2 className="font-semibold">
        Utility Fee Distribution
      </h2>

      <div>
        <label className="text-sm">Burn %</label>
        <input
          type="number"
          min={0}
          max={100}
          value={burn}
          onChange={e => setBurn(Number(e.target.value))}
          className="input"
        />
      </div>

      <div>
        <label className="text-sm">Treasury %</label>
        <input
          type="number"
          min={0}
          max={100}
          value={treasury}
          onChange={e => setTreasury(Number(e.target.value))}
          className="input"
        />
      </div>

      <div className="text-sm text-gray-600">
        Utility Pool Receives:{" "}
        <b>{remaining}%</b>
      </div>

      <button
        onClick={save}
        className="btn-primary w-full"
      >
        Save Utility Fees
      </button>
    </div>
  );
}