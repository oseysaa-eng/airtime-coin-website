type Props = {
  flagged: number;
};

export default function RecentWarnings({ flagged }: Props) {
  const healthy = flagged === 0;

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <h3 className="font-semibold mb-2">System Warnings</h3>

      {healthy ? (
        <p className="text-green-600">✅ No critical issues detected</p>
      ) : (
        <p className="text-red-600">
          ⚠️ {flagged} flagged calls detected today
        </p>
      )}
    </div>
  );
}