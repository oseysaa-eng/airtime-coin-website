"use client";

import adminApi from "@/lib/adminApi";

export default function FraudActions({ user }: { user: any }) {
  const adjustTrust = async (delta: number) => {
    const reason = prompt("Reason for trust change?");
    if (!reason) return;

    await adminApi.post(`/users/bulk`, {
      userIds: [user._id],
      action: "SET_TRUST",
      value: user.trustScore + delta,
      reason,
    });

    alert("Trust updated");
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => adjustTrust(-10)}
        className="px-2 py-1 bg-red-600 text-white rounded text-xs"
      >
        −10
      </button>
      <button
        onClick={() => adjustTrust(+10)}
        className="px-2 py-1 bg-green-600 text-white rounded text-xs"
      >
        +10
      </button>
    </div>
  );
}