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
  pageviews: number;
  visitors: number;
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
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 px-4 py-3 text-sm">
      <p className="font-medium text-gray-900 mb-2">{formatted}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-500">
            {entry.dataKey === "pageviews" ? "Pageviews" : "Besucher"}:
          </span>
          <span className="font-semibold text-gray-800 tabular-nums">
            {entry.value.toLocaleString("de-DE")}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function TrafficChart({ data }: Props) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="gradPageviews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradVisitors" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
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
            tick={{ fontSize: 11, fill: "#9ca3af" }}
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
            dataKey="pageviews"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#gradPageviews)"
            name="Pageviews"
          />
          <Area
            type="monotone"
            dataKey="visitors"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#gradVisitors)"
            name="Besucher"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
