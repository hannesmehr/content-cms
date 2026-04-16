"use client";

import { useState, useEffect, useCallback } from "react";
import InteractiveTraffic from "./InteractiveTraffic";

function fmt(n: number | null | undefined): string {
  return (n ?? 0).toLocaleString("de-DE");
}

const TIME_RANGES = [
  { label: "24h", hours: 24 },
  { label: "48h", hours: 48 },
  { label: "72h", hours: 72 },
  { label: "1W", hours: 168 },
  { label: "2W", hours: 336 },
  { label: "3W", hours: 504 },
  { label: "1M", hours: 720 },
];

type PerSite = { slug: string; domain: string; pageviews: number; visitors: number; bounceRate: number; affiliateClicks: number };
type Stats = { pageviews: { value: number; prev: number }; visitors: { value: number; prev: number }; bounceRate: number; prevBounceRate: number; avgDuration: number; prevAvgDuration: number; affiliateClicks: number };
type Referrer = { name: string; count: number };
type SiteReferrers = { site: string; domain: string; referrers: Referrer[] };
type ChartPoint = { date: string; pageviews: number; visitors: number };

type Props = { articles: number; images: number; avgScore: number; initialChartData: ChartPoint[] };

function DeltaBadge({ value, prev, invert }: { value: number; prev: number; invert?: boolean }) {
  if (prev === 0) return null;
  const pct = Math.round(((value - prev) / prev) * 100);
  if (pct === 0) return null;
  const isGood = invert ? pct < 0 : pct > 0;
  return <span className={`text-xs font-medium ${isGood ? "text-emerald-500" : "text-red-400"}`}>{pct > 0 ? "+" : ""}{pct}%</span>;
}

function formatDuration(s: number): string { return s < 60 ? `${Math.round(s)}s` : `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`; }

function RangePicker({ active, onChange }: { active: number; onChange: (i: number) => void }) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-0.5">
      {TIME_RANGES.map((r, i) => (
        <button key={r.label} onClick={() => onChange(i)} className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${active === i ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>{r.label}</button>
      ))}
    </div>
  );
}

// ═══ Main Component ═══

export default function OverviewKpis({ articles, images, avgScore, initialChartData }: Props) {
  // KPI state
  const [kpiRange, setKpiRange] = useState(6);
  const [stats, setStats] = useState<Stats | null>(null);
  const [perSite, setPerSite] = useState<PerSite[]>([]);
  const [kpiLoading, setKpiLoading] = useState(false);
  const [expandedKpi, setExpandedKpi] = useState<string | null>(null);

  // Referrer state
  const [refRange, setRefRange] = useState(6);
  const [topReferrers, setTopReferrers] = useState<Referrer[]>([]);
  const [referrersBySite, setReferrersBySite] = useState<SiteReferrers[]>([]);
  const [refLoading, setRefLoading] = useState(false);

  const fetchKpis = useCallback(async (hours: number) => {
    setKpiLoading(true);
    try {
      const res = await fetch(`/api/admin/traffic?hours=${hours}`);
      if (res.ok) { const j = await res.json(); setStats(j.stats || null); setPerSite(j.perSite || []); }
    } catch {} finally { setKpiLoading(false); }
  }, []);

  const fetchReferrers = useCallback(async (hours: number) => {
    setRefLoading(true);
    try {
      const res = await fetch(`/api/admin/traffic?hours=${hours}`);
      if (res.ok) { const j = await res.json(); setTopReferrers(j.topReferrers || []); setReferrersBySite(j.referrersBySite || []); }
    } catch {} finally { setRefLoading(false); }
  }, []);

  useEffect(() => { fetchKpis(TIME_RANGES[6].hours); }, [fetchKpis]);
  useEffect(() => { fetchReferrers(TIME_RANGES[6].hours); }, [fetchReferrers]);

  useEffect(() => {
    if (!expandedKpi) return;
    const close = () => setExpandedKpi(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [expandedKpi]);

  return (
    <>
      {/* ═══ KPI Cards ═══ */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-400 uppercase tracking-wider">KPIs</p>
        <RangePicker active={kpiRange} onChange={(i) => { setKpiRange(i); fetchKpis(TIME_RANGES[i].hours); }} />
      </div>
      <div className={`grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-8 transition-opacity duration-200 ${kpiLoading ? "opacity-50" : ""}`}>
        <KpiCard label="Pageviews" value={stats?.pageviews?.value} prev={stats?.pageviews?.prev} accent="blue"
          breakdown={perSite.map((s) => ({ label: s.domain, value: s.pageviews }))} expanded={expandedKpi === "pv"} onToggle={() => setExpandedKpi(expandedKpi === "pv" ? null : "pv")} />
        <KpiCard label="Besucher" value={stats?.visitors?.value} prev={stats?.visitors?.prev} accent="purple"
          breakdown={perSite.map((s) => ({ label: s.domain, value: s.visitors }))} expanded={expandedKpi === "vis"} onToggle={() => setExpandedKpi(expandedKpi === "vis" ? null : "vis")} />
        <KpiCard label="Bounce" value={stats?.bounceRate} prev={stats?.prevBounceRate} accent="amber" suffix="%" invert />
        <KpiCard label="Ø Dauer" formatted={stats ? formatDuration(stats.avgDuration) : "–"} accent="gray" />
        <KpiCard label="Aff. Klicks" value={stats?.affiliateClicks} accent="orange"
          breakdown={perSite.filter((s) => s.affiliateClicks > 0).map((s) => ({ label: s.domain, value: s.affiliateClicks }))} expanded={expandedKpi === "aff"} onToggle={() => setExpandedKpi(expandedKpi === "aff" ? null : "aff")} />
        <KpiCard label="Artikel" value={articles} accent="green" />
        <KpiCard label="Bilder" value={images} accent="blue" />
        <KpiCard label="Score Ø" value={avgScore} accent="purple" suffix="/100" />
      </div>

      {/* ═══ Traffic Chart (eigener Picker) ═══ */}
      <div className="mb-8">
        <InteractiveTraffic initialData={initialChartData} />
      </div>

      {/* ═══ Top Referrer (eigener Picker) ═══ */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Top Referrer</h2>
          <RangePicker active={refRange} onChange={(i) => { setRefRange(i); fetchReferrers(TIME_RANGES[i].hours); }} />
        </div>
        <div className={`p-5 transition-opacity duration-200 ${refLoading ? "opacity-50" : ""}`}>
          {topReferrers.length > 0 ? (
            <>
              <div className="space-y-2 mb-5">
                {topReferrers.slice(0, 10).map((ref, i) => {
                  const maxCount = topReferrers[0]?.count || 1;
                  const pct = Math.round((ref.count / maxCount) * 100);
                  return (
                    <div key={ref.name} className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-4 text-right tabular-nums">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-sm text-gray-700 truncate">{ref.name.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span>
                          <span className="text-sm font-semibold text-gray-900 tabular-nums ml-2">{ref.count}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {referrersBySite.length > 1 && (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Nach Site</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {referrersBySite.map((site) => (
                      <div key={site.site}>
                        <p className="text-xs font-medium text-gray-600 mb-1.5">{site.domain.replace(/^www\./, "")}</p>
                        <div className="space-y-1">
                          {site.referrers.slice(0, 5).map((ref) => (
                            <div key={ref.name} className="flex items-center justify-between text-xs">
                              <span className="text-gray-500 truncate max-w-[140px]">{ref.name.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span>
                              <span className="font-semibold text-gray-700 tabular-nums ml-2">{ref.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">Keine Referrer-Daten</p>
          )}
        </div>
      </div>
    </>
  );
}

// ═══ KPI Card ═══

const ACCENT_BORDERS: Record<string, string> = {
  blue: "border-l-blue-500", purple: "border-l-purple-500", amber: "border-l-amber-500",
  orange: "border-l-orange-500", green: "border-l-emerald-500", gray: "border-l-gray-400",
};

function KpiCard({ label, value, prev, accent, suffix, invert, formatted, breakdown, expanded, onToggle }: {
  label: string; value?: number | null; prev?: number | null; accent: string; suffix?: string; invert?: boolean;
  formatted?: string; breakdown?: { label: string; value: number }[]; expanded?: boolean; onToggle?: () => void;
}) {
  const hasBreakdown = breakdown && breakdown.length > 0;
  const displayValue = formatted ?? (value != null ? `${fmt(value)}${suffix || ""}` : "–");

  return (
    <div className="relative" onClick={(e) => { if (hasBreakdown) { e.stopPropagation(); onToggle?.(); } }}>
      <div className={`bg-white rounded-xl border border-gray-200 border-l-4 ${ACCENT_BORDERS[accent] || "border-l-gray-300"} shadow-sm p-3 ${hasBreakdown ? "cursor-pointer hover:shadow-md" : ""} transition-all`}>
        <p className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-1">
          {label}
          {hasBreakdown && <svg className={`w-2.5 h-2.5 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>}
        </p>
        <p className="text-xl font-bold text-gray-900 tabular-nums mt-0.5">{displayValue}</p>
        {prev != null && value != null && <DeltaBadge value={value} prev={prev} invert={invert} />}
      </div>
      {expanded && breakdown && breakdown.length > 0 && (
        <div className="absolute top-full left-0 mt-1 z-30 bg-white rounded-xl border border-gray-200 shadow-lg p-3 min-w-[180px]">
          <div className="space-y-1.5">
            {breakdown.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-xs">
                <span className="text-gray-600 truncate max-w-[120px]">{item.label.replace(/^www\./, "")}</span>
                <span className="font-semibold text-gray-900 tabular-nums ml-2">{fmt(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
