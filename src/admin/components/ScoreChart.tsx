"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type ScoreChartProps = {
  data: { range: string; count: number }[];
};

const BAR_COLORS = [
  "#ef4444", // 0-20: red
  "#f59e0b", // 21-40: amber
  "#eab308", // 41-60: yellow
  "#22c55e", // 61-80: green
  "#10b981", // 81-100: emerald
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 px-4 py-3 text-sm">
      <p className="font-medium text-gray-900 mb-1">Score {label}</p>
      <p className="text-gray-500">
        <span className="font-semibold text-gray-800">{payload[0].value}</span> Artikel
      </p>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomBarLabel({ x, y, width, value }: any) {
  if (!value) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill="#374151"
      textAnchor="middle"
      fontSize={12}
      fontWeight={600}
    >
      {value}
    </text>
  );
}

export default function ScoreChart({ data }: ScoreChartProps) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
          <defs>
            {BAR_COLORS.map((color, i) => (
              <linearGradient key={i} id={`scoreGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                <stop offset="100%" stopColor={color} stopOpacity={0.5} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f1f5f9"
            vertical={false}
          />
          <XAxis
            dataKey="range"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f5f9" }} />
          <Bar
            dataKey="count"
            name="Artikel"
            radius={[8, 8, 0, 0]}
            label={<CustomBarLabel />}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={`url(#scoreGrad${index})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
