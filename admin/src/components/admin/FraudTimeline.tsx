"use client";

import clsx from "clsx";

type Props = {
  events: any[];
};

export default function FraudTimeline({ events }: Props) {
  if (!events || events.length === 0) {
    return (
      <div className="text-sm text-zinc-500 mt-4">
        No fraud history detected.
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-sm mb-3">
        Fraud Timeline
      </h3>

      <div className="space-y-3">
        {events.map((e, i) => (
          <div
            key={i}
            className={clsx(
              "p-3 rounded border text-sm",
              e.severity === "critical" &&
                "border-red-500 bg-red-50",
              e.severity === "warning" &&
                "border-orange-400 bg-orange-50",
              e.severity === "info" &&
                "border-zinc-200 bg-white"
            )}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">
                {e.message}
              </span>
              <span className="text-xs text-zinc-500">
                {new Date(e.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}