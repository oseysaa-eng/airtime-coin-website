"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"];

export default function TrustChart({ trust }: any) {
  const data = trust.map((t: any, index: number) => ({
    name:
      index === 0 ? "Low (0-40)" :
      index === 1 ? "Medium (40-60)" :
      index === 2 ? "Good (60-80)" :
      "High (80-100)",
    value: t.count,
  }));

  return (
    <div className="card h-[300px]">
      <h2 className="text-lg font-bold mb-2">Trust Distribution</h2>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            outerRadius={100}
            label
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}