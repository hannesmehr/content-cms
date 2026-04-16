"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DataPoint = {
  date: string;
  inIndex: number;
};

type Props = {
  data: DataPoint[];
};

function parseBingDate(dateStr: string): Date {
  const match = dateStr.match(/\d+/);
  return new Date(parseInt(match?.[0] || "0"));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const date = parseBingDate(label);
  const formatted = date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return (
    <div className="bg-gray-900 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-medium text-gray-300 mb-1">{formatted}</p>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full shrink-0 bg-emerald-500" />
        <span className="text-gray-400">Indexiert:</span>
        <span className="font-semibold text-white tabular-nums">
          {payload[0].value.toLocaleString("de-DE")}
        </span>
      </div>
    </div>
  );
}

export default function BingIndexChart({ data }: Props) {
  return (
    <div className="h-32">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
          <defs>
            <linearGradient id="gradBingIndex" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 9, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => {
              const d = parseBingDate(val);
              return `${d.getDate()}.${d.getMonth() + 1}.`;
            }}
            interval="preserveStartEnd"
            minTickGap={30}
          />
          <YAxis
            tick={{ fontSize: 9, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            domain={["dataMin - 5", "dataMax + 5"]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="inIndex"
            stroke="#10b981"
            strokeWidth={1.5}
            fill="url(#gradBingIndex)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
