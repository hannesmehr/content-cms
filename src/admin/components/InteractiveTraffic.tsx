"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type TimeRange = { label: string; hours: number };

const TIME_RANGES: TimeRange[] = [
  { label: "24h", hours: 24 },
  { label: "48h", hours: 48 },
  { label: "72h", hours: 72 },
  { label: "1W", hours: 168 },
  { label: "2W", hours: 336 },
  { label: "3W", hours: 504 },
  { label: "1M", hours: 720 },
];

type ChartPoint = { date: string; pageviews: number; visitors: number };

type Stats = {
  pageviews: { value: number; prev: number };
  visitors: { value: number; prev: number };
  bounceRate: number;
  prevBounceRate: number;
  avgDuration: number;
  prevAvgDuration: number;
  affiliateClicks?: number;
};

type PerSite = {
  slug: string;
  domain: string;
  pageviews: number;
  visitors: number;
  bounceRate: number;
  affiliateClicks: number;
};

type StaticKpis = {
  articles: number;
  images: number;
  avgScore: number;
};

type Props = {
  siteSlug?: string;
  initialData?: ChartPoint[];
  initialStats?: Stats;
  showBreakdown?: boolean;
  staticKpis?: StaticKpis;
  hideHeader?: boolean; // Only render chart, no KPIs/picker (controlled externally)
};

function fmt(n: number | null | undefined): string {
  return (n ?? 0).toLocaleString("de-DE");
}

function DeltaBadge({ value, prev, invert }: { value: number; prev: number; invert?: boolean }) {
  if (prev === 0) return null;
  const pct = Math.round(((value - prev) / prev) * 100);
  if (pct === 0) return null;
  const isGood = invert ? pct < 0 : pct > 0;
  return (
    <span className={`text-xs font-medium ${isGood ? "text-emerald-500" : "text-red-400"}`}>
      {pct > 0 ? "+" : ""}{pct}%
    </span>
  );
}

function formatDateLabel(dateStr: string, isHourly: boolean): string {
  const d = new Date(dateStr);
  return isHourly ? `${d.getHours()}:00` : `${d.getDate()}.${d.getMonth() + 1}.`;
}

function formatTooltipDate(dateStr: string, isHourly: boolean): string {
  const d = new Date(dateStr);
  if (isHourly) return d.toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
}

export default function InteractiveTraffic({ siteSlug, initialData, initialStats, showBreakdown, staticKpis, hideHeader }: Props) {
  const [activeRange, setActiveRange] = useState(6); // 1M
  const [data, setData] = useState<ChartPoint[]>(initialData || []);
  const [stats, setStats] = useState<Stats | null>(initialStats || null);
  const [perSite, setPerSite] = useState<PerSite[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedKpi, setExpandedKpi] = useState<string | null>(null);

  const fetchData = useCallback(async (hours: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ hours: String(hours) });
      if (siteSlug) params.set("site", siteSlug);
      const res = await fetch(`/api/admin/traffic?${params}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.chart || []);
        setStats(json.stats || null);
        setPerSite(json.perSite || []);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [siteSlug]);

  const handleRangeChange = (index: number) => {
    setActiveRange(index);
    fetchData(TIME_RANGES[index].hours);
  };

  // When controlled externally (hideHeader), sync data from props
  useEffect(() => {
    if (hideHeader && initialData) {
      setData(initialData);
    }
  }, [hideHeader, initialData]);

  useEffect(() => {
    if (hideHeader) return; // Don't auto-fetch when controlled externally
    if (!initialData || initialData.length === 0) {
      fetchData(TIME_RANGES[6].hours);
    } else {
      if (showBreakdown) fetchData(TIME_RANGES[6].hours);
    }
  }, [fetchData, initialData, showBreakdown, hideHeader]);

  const isHourly = TIME_RANGES[activeRange].hours <= 72;
  const rangeLabel = TIME_RANGES[activeRange].label;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header: KPIs + Range Picker (hidden when controlled externally) */}
      {!hideHeader && <div className="px-5 pt-5 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          {/* KPI Mini Cards */}
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <KpiMini
              label="Pageviews"
              value={stats?.pageviews?.value}
              prev={stats?.pageviews?.prev}
              expanded={expandedKpi === "pageviews"}
              onToggle={() => setExpandedKpi(expandedKpi === "pageviews" ? null : "pageviews")}
              breakdown={showBreakdown ? perSite.map((s) => ({ label: s.domain, value: s.pageviews })) : undefined}
            />
            <KpiMini
              label="Besucher"
              value={stats?.visitors?.value}
              prev={stats?.visitors?.prev}
              expanded={expandedKpi === "visitors"}
              onToggle={() => setExpandedKpi(expandedKpi === "visitors" ? null : "visitors")}
              breakdown={showBreakdown ? perSite.map((s) => ({ label: s.domain, value: s.visitors })) : undefined}
            />
            <KpiMini
              label="Bounce"
              value={stats?.bounceRate}
              prev={stats?.prevBounceRate}
              suffix="%"
              invert
              className="hidden sm:block"
            />
            <KpiMini
              label="Ø Dauer"
              value={stats ? Math.round(stats.avgDuration) : undefined}
              formatted={stats ? formatDuration(stats.avgDuration) : "–"}
              className="hidden sm:block"
            />
            {stats?.affiliateClicks !== undefined && (
              <KpiMini
                label="Aff. Klicks"
                value={stats.affiliateClicks}
                expanded={expandedKpi === "clicks"}
                onToggle={() => setExpandedKpi(expandedKpi === "clicks" ? null : "clicks")}
                breakdown={showBreakdown ? perSite.filter((s) => s.affiliateClicks > 0).map((s) => ({ label: s.domain, value: s.affiliateClicks })) : undefined}
              />
            )}
            {/* Static KPIs (not time-range dependent) */}
            {staticKpis && (
              <>
                <div className="hidden sm:block w-px h-10 bg-gray-200 self-center" />
                <KpiMini label="Artikel" value={staticKpis.articles} />
                <KpiMini label="Bilder" value={staticKpis.images} className="hidden md:block" />
                <KpiMini label="Score Ø" value={staticKpis.avgScore} suffix="/100" className="hidden md:block" />
              </>
            )}
          </div>

          {/* Time Range Picker */}
          <div className="flex bg-gray-100 rounded-lg p-0.5 shrink-0">
            {TIME_RANGES.map((range, i) => (
              <button
                key={range.label}
                onClick={() => handleRangeChange(i)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeRange === i
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>}

      {/* Chart */}
      <div className="px-2 pb-2">
        <div className={`h-64 transition-opacity duration-200 ${loading ? "opacity-40" : "opacity-100"}`}>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="visGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => formatDateLabel(v, isHourly)}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "0.75rem", padding: "10px 14px", fontSize: "12px" }}
                  itemStyle={{ color: "#e2e8f0" }}
                  labelFormatter={(v) => formatTooltipDate(v, isHourly)}
                  labelStyle={{ color: "#94a3b8", marginBottom: "4px", fontSize: "11px" }}
                />
                <Area type="monotone" dataKey="pageviews" name="Pageviews" stroke="#3b82f6" strokeWidth={2} fill="url(#pvGrad)" />
                <Area type="monotone" dataKey="visitors" name="Besucher" stroke="#8b5cf6" strokeWidth={2} fill="url(#visGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-gray-400">
              {loading ? "Lade Daten..." : "Keine Daten verfügbar"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- KPI Mini with optional breakdown dropdown ---

function KpiMini({
  label,
  value,
  prev,
  suffix,
  invert,
  formatted,
  className,
  expanded,
  onToggle,
  breakdown,
}: {
  label: string;
  value?: number | null;
  prev?: number | null;
  suffix?: string;
  invert?: boolean;
  formatted?: string;
  className?: string;
  expanded?: boolean;
  onToggle?: () => void;
  breakdown?: { label: string; value: number }[];
}) {
  const hasBreakdown = breakdown && breakdown.length > 0;
  const displayValue = formatted ?? (value != null ? `${fmt(value)}${suffix || ""}` : "–");

  return (
    <div className={`relative ${className || ""}`}>
      <button
        onClick={hasBreakdown ? onToggle : undefined}
        className={`text-left ${hasBreakdown ? "cursor-pointer" : "cursor-default"}`}
      >
        <p className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-1">
          {label}
          {hasBreakdown && (
            <svg className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          )}
        </p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-gray-900 tabular-nums">{displayValue}</p>
          {prev != null && value != null && (
            <DeltaBadge value={value} prev={prev} invert={invert} />
          )}
        </div>
      </button>

      {/* Breakdown Dropdown */}
      {expanded && breakdown && breakdown.length > 0 && (
        <div className="absolute top-full left-0 mt-1 z-20 bg-white rounded-xl border border-gray-200 shadow-lg p-3 min-w-[200px]">
          <div className="space-y-1.5">
            {breakdown.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-xs">
                <span className="text-gray-600 truncate max-w-[140px]">{item.label.replace(/^www\./, "")}</span>
                <span className="font-semibold text-gray-900 tabular-nums ml-3">{fmt(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
