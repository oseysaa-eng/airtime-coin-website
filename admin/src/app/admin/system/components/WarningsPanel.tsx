"use client";

import clsx from "clsx";

type WarningItem = {
  id: string;
  level: "critical" | "warning" | "info";
  title: string;
  message: string;
  action?: {
    label: string;
    href: string;
  };
};

type WarningsPanelProps = {
  warnings: WarningItem[];
};

export default function WarningsPanel({
  warnings,
}: WarningsPanelProps) {
  if (!warnings || warnings.length === 0) {
    return (
      <div className="rounded-xl border bg-green-50 p-6 text-green-700">
        ✅ All systems healthy. No warnings detected.
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-red-600">
        System Warnings
      </h2>

      <div className="space-y-3">
        {warnings.map(w => (
          <div
            key={w.id}
            className={clsx(
              "rounded-xl border p-4",
              w.level === "critical" &&
                "border-red-400 bg-red-50",
              w.level === "warning" &&
                "border-orange-400 bg-orange-50",
              w.level === "info" &&
                "border-blue-300 bg-blue-50"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3
                  className={clsx(
                    "font-semibold",
                    w.level === "critical" &&
                      "text-red-700",
                    w.level === "warning" &&
                      "text-orange-700",
                    w.level === "info" &&
                      "text-blue-700"
                  )}
                >
                  {w.title}
                </h3>

                <p className="mt-1 text-sm text-gray-700">
                  {w.message}
                </p>
              </div>

              {w.action && (
                <a
                  href={w.action.href}
                  className="text-sm font-medium underline hover:opacity-80"
                >
                  {w.action.label}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
