"use client";

type Warning = {
  message: string;
  createdAt: string;
};

type Props = {
  warnings: Warning[];
};

export default function RecentWarnings({ warnings }: Props) {

  if (!warnings || warnings.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-3">
          System Warnings
        </h2>

        <p className="text-sm text-gray-500">
          No warnings.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-6">

      <h2 className="text-lg font-semibold mb-4">
        System Warnings
      </h2>

      <div className="space-y-2">

        {warnings.map((w, i) => (
          <div
            key={i}
            className="text-sm border-l-4 border-orange-500 pl-3"
          >
            <div>{w.message}</div>

            <div className="text-xs text-gray-400">
              {new Date(w.createdAt).toLocaleString()}
            </div>
          </div>
        ))}

      </div>

    </div>
  );
}