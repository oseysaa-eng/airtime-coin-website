"use client";

import clsx from "clsx";

export default function FraudTimeline({
  events,
}: {
  events: any[];
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-4">Recent Fraud Events</h3>

      <ul className="space-y-3">
        {events.map((e, i) => (
          <li
            key={i}
            className={clsx(
              "p-3 rounded border text-sm",
              e.severity === "critical"
                ? "border-red-500 bg-red-50"
                : e.severity === "warning"
                ? "border-orange-400 bg-orange-50"
                : "border-zinc-200"
            )}
          >
            <div className="font-medium">{e.message}</div>
            <div className="text-xs text-zinc-500">
              {new Date(e.createdAt).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}