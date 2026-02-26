"use client";

import adminApi from "@/lib/adminApi";
import { useEffect, useState } from "react";

export default function UtilityPricingControls() {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.get("/utility/pricing").then(res => {
      setData(res.data);
    });
  }, []);

  if (!data) return null;

  const save = async () => {
    setSaving(true);
    await adminApi.post("/utility/pricing", {
      basePrice: Number(data.basePrice),
      minPrice: Number(data.minPrice),
      maxPrice: Number(data.maxPrice),
    });
    setSaving(false);
    alert("Pricing updated");
  };

  return (
    <div className="card space-y-4">
      <h2 className="text-lg font-semibold">
        Utility Pricing Engine
      </h2>

      <p className="text-sm text-gray-500">
        ATC utility price adjusts automatically based on demand,
        burn and circulating supply.
      </p>

      <div className="grid grid-cols-3 gap-4">
        <Field
          label="Base Price"
          value={data.basePrice}
          onChange={v =>
            setData({ ...data, basePrice: v })
          }
        />

        <Field
          label="Min Price Floor"
          value={data.minPrice}
          onChange={v =>
            setData({ ...data, minPrice: v })
          }
        />

        <Field
          label="Max Price Cap"
          value={data.maxPrice}
          onChange={v =>
            setData({ ...data, maxPrice: v })
          }
        />
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="bg-black text-white px-6 py-2 rounded hover:bg-zinc-800"
      >
        {saving ? "Saving…" : "Save Pricing"}
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: any) {
  return (
    <div>
      <label className="text-sm font-medium">
        {label}
      </label>
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="mt-1 w-full border rounded px-3 py-2"
      />
    </div>
  );
}