"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function CallTrendChart({ data }: any) {
  return (
    <div className="card h-[320px]">
      <h2 className="text-lg font-bold mb-2">Live Call Activity</h2>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />

          <XAxis dataKey="date" hide />
          <YAxis hide />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="calls"
            stroke="#0ea5a4"
            strokeWidth={3}
            dot={false}
            isAnimationActive={true}
            animationDuration={500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}