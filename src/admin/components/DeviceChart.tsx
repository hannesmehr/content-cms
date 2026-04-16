"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type DataPoint = {
  name: string;
  value: number;
};

type Props = {
  data: DataPoint[];
};

const DEVICE_COLORS: Record<string, string> = {
  desktop: "#3b82f6",
  laptop: "#3b82f6",
  mobile: "#22c55e",
  tablet: "#f59e0b",
};

function getColor(name: string): string {
  return DEVICE_COLORS[name.toLowerCase()] || "#94a3b8";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0];
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 px-4 py-3 text-sm">
      <p className="font-medium text-gray-900">{data.name}</p>
      <p className="text-gray-500">
        <span className="font-semibold text-gray-800 tabular-nums">
          {data.value.toLocaleString("de-DE")}
        </span>{" "}
        Besuche
      </p>
    </div>
  );
}

export default function DeviceChart({ data }: Props) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex items-center gap-4">
      <div className="h-40 w-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={65}
              paddingAngle={3}
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={getColor(entry.name)} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-2">
        {data.map((item) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={item.name} className="flex items-center gap-2 text-sm">
              <span
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: getColor(item.name) }}
              />
              <span className="text-gray-700 capitalize">{item.name}</span>
              <span className="text-gray-400 tabular-nums text-xs">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
