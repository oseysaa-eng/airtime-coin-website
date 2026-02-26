type Props = {
  trust: any[];
};

export default function TrustChart({ trust }: Props) {
  if (!trust || trust.length === 0) {
    return (
      <div className="card">
        <h2 className="font-semibold mb-2">
          Trust Distribution
        </h2>
        <p className="text-sm text-gray-500">
          No trust data available
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="font-semibold mb-3">
        Trust Distribution
      </h2>

      <div className="space-y-2">
        {trust.map(t => (
          <div
            key={t._id}
            className="flex justify-between text-sm"
          >
            <span className="text-gray-600">
              {t._id === "unknown"
                ? "Unknown"
                : `${t._id}+`}
            </span>
            <span className="font-medium">
              {t.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}