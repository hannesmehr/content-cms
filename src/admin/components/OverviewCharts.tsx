"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type PieItem = { name: string; value: number; color: string };
type HeatmapItem = { site: string; domain: string; ranges: number[] };

type Props = {
  pieData: PieItem[];
  heatmapData: HeatmapItem[];
  scoreRanges: string[];
};

function getHeatColor(count: number, max: number): string {
  if (max === 0 || count === 0) return "bg-gray-100";
  const ratio = count / max;
  if (ratio > 0.6) return "bg-emerald-500 text-white";
  if (ratio > 0.3) return "bg-emerald-300 text-emerald-900";
  if (ratio > 0.1) return "bg-emerald-100 text-emerald-700";
  return "bg-gray-100 text-gray-500";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0];
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2 text-sm">
      <p className="font-medium text-gray-900">{data.name}</p>
      <p className="text-gray-500">{data.value} Artikel</p>
    </div>
  );
}

export default function OverviewCharts({
  pieData,
  heatmapData,
  scoreRanges,
}: Props) {
  const totalArticles = pieData.reduce((sum, d) => sum + d.value, 0);
  const maxHeatValue = Math.max(
    ...heatmapData.flatMap((d) => d.ranges),
    1
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Donut Chart */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-1">
          Artikel-Verteilung
        </h2>
        <p className="text-xs text-gray-400 mb-4">{totalArticles} Artikel gesamt</p>
        <div className="h-64 flex items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                strokeWidth={0}
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-2 justify-center">
          {pieData.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5 text-xs text-gray-600">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              {item.name}
              <span className="text-gray-400">({item.value})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Score Heatmap */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-1">
          Score-Heatmap
        </h2>
        <p className="text-xs text-gray-400 mb-4">Artikel pro Site und Score-Range</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left py-2 pr-3 font-medium text-gray-500">Site</th>
                {scoreRanges.map((range) => (
                  <th key={range} className="py-2 px-1 font-medium text-gray-500 text-center min-w-[52px]">
                    {range}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmapData.map((row) => (
                <tr key={row.site}>
                  <td className="py-1.5 pr-3 text-gray-700 font-medium truncate max-w-[140px]">
                    {row.domain.replace(/\.(de|com)$/, "")}
                  </td>
                  {row.ranges.map((count, idx) => (
                    <td key={idx} className="py-1.5 px-1 text-center">
                      <div
                        className={`
                          w-full py-2 rounded-lg text-xs font-semibold tabular-nums
                          transition-all duration-200
                          ${getHeatColor(count, maxHeatValue)}
                        `}
                      >
                        {count}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-4 text-xs text-gray-400 justify-end">
          <span>Wenig</span>
          <div className="flex gap-1">
            <div className="w-5 h-3 rounded bg-gray-100" />
            <div className="w-5 h-3 rounded bg-emerald-100" />
            <div className="w-5 h-3 rounded bg-emerald-300" />
            <div className="w-5 h-3 rounded bg-emerald-500" />
          </div>
          <span>Viel</span>
        </div>
      </div>
    </div>
  );
}
