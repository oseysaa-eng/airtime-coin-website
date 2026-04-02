"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function FraudHeatmap({ data = [] }: any) {
  return (
    <div className="card h-[320px]">
      <h2 className="text-lg font-bold mb-2">Fraud by Hour</h2>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />

          <XAxis dataKey="hour" />
          <YAxis />

          <Tooltip />

          <Bar
            dataKey="count"
            fill="#ef4444"
            radius={[6, 6, 0, 0]}
            isAnimationActive
            animationDuration={600}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}