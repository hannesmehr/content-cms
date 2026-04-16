"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DataPoint = {
  date: string;
  clicks: number;
  impressions: number;
};

type Props = {
  data: DataPoint[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const date = new Date(label);
  const formatted = date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return (
    <div className="bg-gray-900 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-medium text-gray-300 mb-1.5">{formatted}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-400">
            {entry.dataKey === "impressions" ? "Impressionen" : "Klicks"}:
          </span>
          <span className="font-semibold text-white tabular-nums">
            {entry.value.toLocaleString("de-DE")}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function GscTrendChart({ data }: Props) {
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id="gradGscImpressions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={false}
            tickFormatter={(val) => {
              const d = new Date(val);
              return `${d.getDate()}.${d.getMonth() + 1}.`;
            }}
            interval="preserveStartEnd"
            minTickGap={40}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            tickFormatter={(val) =>
              val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toString()
            }
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="impressions"
            stroke="#3b82f6"
            strokeWidth={1.5}
            fill="url(#gradGscImpressions)"
            name="Impressionen"
          />
          <Area
            type="monotone"
            dataKey="clicks"
            stroke="#22c55e"
            strokeWidth={1.5}
            fill="none"
            name="Klicks"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
