"use client";

type FreshnessItem = {
  label: string;
  count: number;
  color: string;
};

type Props = {
  data: FreshnessItem[];
  total: number;
};

export default function FreshnessChart({ data, total }: Props) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-4 pt-2">
      {data.map((item) => {
        const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
        const barWidth = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

        return (
          <div key={item.label} className="group">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-sm shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-700 font-medium">{item.label}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 tabular-nums">{item.count} Artikel</span>
                <span className="text-gray-400 tabular-nums">({pct}%)</span>
              </div>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${barWidth}%`,
                  backgroundColor: item.color,
                  opacity: 0.8,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
