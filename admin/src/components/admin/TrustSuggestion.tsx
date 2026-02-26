"use client";

import clsx from "clsx";

type Props = {
  user: any;
  onApply?: (value: number) => void;
};

export default function TrustSuggestion({ user, onApply }: Props) {
  if (!user) return null;

  const fraudCount = user.fraudCount ?? 0;
  const flaggedCalls = user.flaggedCalls ?? 0;
  const ipAbuse = user.ipAbuseCount ?? 0;
  const kycVerified = user.kycStatus === "verified";

  let suggested = 100;
  const reasons: string[] = [];

  if (flaggedCalls >= 3) {
    suggested -= 30;
    reasons.push("Repeated suspicious call patterns");
  }

  if (fraudCount > 0) {
    suggested -= fraudCount * 15;
    reasons.push(`${fraudCount} fraud signal(s) detected`);
  }

  if (ipAbuse > 0) {
    suggested -= 20;
    reasons.push("IP abuse detected");
  }

  if (!kycVerified) {
    suggested -= 10;
    reasons.push("KYC not verified");
  }

  // Clamp between 0–100
  suggested = Math.max(0, Math.min(100, suggested));

  const label =
    suggested < 40
      ? "BLOCK"
      : suggested < 60
      ? "LIMIT"
      : suggested < 80
      ? "REDUCE"
      : "GOOD";

  const badgeColor =
    suggested < 40
      ? "bg-red-600"
      : suggested < 60
      ? "bg-orange-500"
      : suggested < 80
      ? "bg-yellow-500"
      : "bg-green-600";

  return (
    <div className="border rounded-lg p-4 bg-zinc-50 mt-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-sm">
          Trust Suggestion
        </h4>

        <span
          className={clsx(
            "px-2 py-1 rounded-full text-xs text-white",
            badgeColor
          )}
        >
          {label}
        </span>
      </div>

      <div className="text-sm mb-2">
        Suggested Trust Score:
        <span className="font-bold ml-2">{suggested}</span>
      </div>

      {reasons.length > 0 ? (
        <ul className="list-disc list-inside text-xs text-zinc-600 space-y-1">
          {reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-zinc-500">
          No risk signals detected.
        </p>
      )}

      {onApply && (
        <button
          onClick={() => onApply(suggested)}
          className="mt-4 w-full text-sm bg-black text-white py-2 rounded hover:bg-zinc-800"
        >
          Apply Suggested Trust
        </button>
      )}
    </div>
  );
}


