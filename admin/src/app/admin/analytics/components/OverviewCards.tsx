type Props = {
  data: any;
};

export default function OverviewCards({ data }: Props) {
  const stats = [
    { label: "Users", value: data?.users },
    { label: "Total Calls", value: data?.calls },
    { label: "Minutes Earned", value: data?.minutes },
    { label: "ATC Minted", value: data?.atcMinted },
    { label: "Flagged Calls", value: data?.flaggedCalls },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map(s => (
        <StatCard
          key={s.label}
          title={s.label}
          value={s.value}
        />
      ))}
    </div>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="card">
      <p className="text-xs uppercase tracking-wide text-gray-500">
        {title}
      </p>
      <p className="text-2xl font-bold mt-1">
        {value ?? 0}
      </p>
    </div>
  );
}