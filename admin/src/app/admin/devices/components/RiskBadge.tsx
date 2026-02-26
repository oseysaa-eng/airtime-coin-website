"use client";

export default function RiskBadge({ score }: { score: number }) {
  let color = "bg-green-100 text-green-700";

  if (score > 60) {
    color = "bg-red-100 text-red-700";
  } else if (score > 30) {
    color = "bg-orange-100 text-orange-700";
  }

  return (
    <span className={`px-2 py-1 text-xs rounded ${color}`}>
      {score}
    </span>
  );
}