"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

export default function ChartsPanel({ data }: any) {
  return (
    <div className="grid grid-cols-2 gap-6">

      {/* 📞 CALL ACTIVITY */}
      <div className="card p-4">
        <h3 className="font-semibold mb-2">Call Activity</h3>

        <LineChart width={400} height={250} data={data.calls || []}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="count" />
        </LineChart>
      </div>

      {/* 🚨 FRAUD HEAT */}
      <div className="card p-4">
        <h3 className="font-semibold mb-2">Fraud Heatmap</h3>

        <BarChart width={400} height={250} data={data.fraud || []}>
          <XAxis dataKey="hour" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" />
        </BarChart>
      </div>

    </div>
  );
}