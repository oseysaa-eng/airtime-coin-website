"use client";

export default function RiskBadge({ score }: { score?: number }) {

  const risk = score ?? 0;

  let color = "bg-green-100 text-green-700";
  let label = "Low";

  if (risk > 60) {
    color = "bg-red-100 text-red-700";
    label = "High";
  } else if (risk > 30) {
    color = "bg-orange-100 text-orange-700";
    label = "Medium";
  }

  return (
    <span
      className={`px-2 py-1 text-xs rounded font-semibold ${color}`}
    >
      {risk} • {label}
    </span>
  );
}