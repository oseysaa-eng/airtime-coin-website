"use client";

type Props = {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
};

export default function DateRangeFilter({
  from,
  to,
  onChange,
}: Props) {
  return (
    <div className="flex gap-3 items-end">
      <div>
        <label className="text-xs text-gray-500">From</label>
        <input
          type="date"
          value={from}
          onChange={e => onChange(e.target.value, to)}
          className="border rounded px-2 py-1 text-sm"
        />
      </div>

      <div>
        <label className="text-xs text-gray-500">To</label>
        <input
          type="date"
          value={to}
          onChange={e => onChange(from, e.target.value)}
          className="border rounded px-2 py-1 text-sm"
        />
      </div>
    </div>
  );
}