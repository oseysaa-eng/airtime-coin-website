"use client";

import clsx from "clsx";

type Props = {
  user: any;
};

export default function FraudIndicators({ user }: Props) {
  const flagged = user.flaggedCalls ?? 0;
  const patterns = user.suspiciousPatterns ?? 0;
  const ipAbuse = user.ipAbuseCount ?? 0;
  const deviceReuse = user.deviceReuseCount ?? 0;
  const trust = user.trustScore ?? 100;

  // 🔍 Risk scoring (simple, explainable)
  let risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";

  if (trust < 40 || ipAbuse > 10) risk = "CRITICAL";
  else if (flagged > 5 || patterns > 3) risk = "HIGH";
  else if (flagged > 0 || patterns > 0) risk = "MEDIUM";

  const riskColor =
    risk === "CRITICAL"
      ? "bg-red-600"
      : risk === "HIGH"
      ? "bg-orange-500"
      : risk === "MEDIUM"
      ? "bg-yellow-500"
      : "bg-green-600";

  return (
    <div className="mt-8 border-t pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">
          Fraud & Risk Indicators
        </h3>

        <span
          className={clsx(
            "px-3 py-1 rounded-full text-white text-xs",
            riskColor
          )}
        >
          {risk}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <Indicator label="Flagged Calls" value={flagged} />
        <Indicator label="Pattern Abuse" value={patterns} />
        <Indicator label="IP Abuse" value={ipAbuse} />
        <Indicator label="Device Reuse" value={deviceReuse} />
      </div>

      {user.lastFlagReason && (
        <div className="mt-4 text-xs text-red-600 bg-red-50 p-3 rounded">
          <b>Last Flag:</b> {user.lastFlagReason}
        </div>
      )}
    </div>
  );
}

function Indicator({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="border rounded p-3 bg-zinc-50">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}