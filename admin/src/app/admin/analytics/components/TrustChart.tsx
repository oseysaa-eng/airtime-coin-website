"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"];

export default function TrustChart({ trust = [] }: any) {
  const data = trust.map((t: any, index: number) => ({
    name:
      index === 0 ? "Low" :
      index === 1 ? "Medium" :
      index === 2 ? "Good" :
      "High",
    value: t.count,
  }));

  return (
    <div className="card h-[320px]">
      <h2 className="text-lg font-bold mb-2">Trust Distribution</h2>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            outerRadius={100}
            innerRadius={50} // 🔥 donut style
            paddingAngle={4}
            isAnimationActive
            animationDuration={500}
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