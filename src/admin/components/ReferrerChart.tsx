"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DataPoint = {
  name: string;
  value: number;
};

type Props = {
  data: DataPoint[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 px-4 py-3 text-sm">
      <p className="font-medium text-gray-900 mb-1">{label}</p>
      <p className="text-gray-500">
        <span className="font-semibold text-gray-800 tabular-nums">
          {payload[0].value.toLocaleString("de-DE")}
        </span>{" "}
        Besuche
      </p>
    </div>
  );
}

export default function ReferrerChart({ data }: Props) {
  // Shorten long referrer names
  const chartData = data.map((d) => ({
    ...d,
    name: d.name.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""),
  }));

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="gradReferrer" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
            width={120}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
          <Bar
            dataKey="value"
            fill="url(#gradReferrer)"
            radius={[0, 6, 6, 0]}
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
