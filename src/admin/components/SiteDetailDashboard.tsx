"use client";

function fmt(n: number | null | undefined): string {
  return (n ?? 0).toLocaleString("de-DE");
}

import { useState, useEffect } from "react";
import Link from "next/link";
import InteractiveTraffic from "./InteractiveTraffic";
import DeviceChart from "./DeviceChart";
import GscTrendChart from "./GscTrendChart";
import BingIndexChart from "./BingIndexChart";
import ScoreChart from "./ScoreChart";
import FreshnessChart from "./FreshnessChart";

// --- Types ---

type UmamiStats = {
  pageviews: { value: number; prev: number };
  visitors: { value: number; prev: number };
  visits: { value: number; prev: number };
  bounces: { value: number; prev: number };
  totaltime: { value: number; prev: number };
};

type UmamiMetric = { x: string; y: number };

type GscSummary = {
  totalClicks: number;
  totalImpressions: number;
  avgCtr: number;
  avgPosition: number;
  topQueries: { query: string; clicks: number; impressions: number; ctr: number; position: number }[];
  topPages: { page: string; clicks: number; impressions: number; position: number }[];
  dailyTrend: { date: string; clicks: number; impressions: number }[];
};

type BingSummary = {
  inIndex: number;
  crawledToday: number;
  crawlErrors: number;
  totalClicks: number;
  totalImpressions: number;
  topQueries: { query: string; clicks: number; impressions: number; position: number }[];
  indexTrend: { date: string; inIndex: number }[];
};

type SiteDetailData = {
  kpis: {
    articles: number;
    avgScore: number;
    clicks: number;
    images: number;
    scoredCount: number;
  };
  scoreDistribution: { range: string; count: number }[];
  topArticles: {
    slug: string;
    title: string;
    score: number;
    lastFactCheck: string | null;
    featured: boolean;
  }[];
  noFactCheck: { slug: string; title: string; score: number }[];
  freshnessData: { label: string; count: number; color: string }[];
  umami: {
    stats: UmamiStats | null;
    trafficChart: { date: string; pageviews: number; visitors: number }[];
    topPages: UmamiMetric[] | null;
    referrers: UmamiMetric[] | null;
    devices: UmamiMetric[] | null;
    events: UmamiMetric[] | null;
  } | null;
  gsc: GscSummary | null;
  bing: BingSummary | null;
};

type Props = {
  siteSlug: string;
  siteName: string;
  siteDomain: string;
  hasUmami: boolean;
};

// --- Skeleton Components ---

function SkeletonKpiCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
      <div className="space-y-3">
        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
        <div className="h-7 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
  );
}

function SkeletonChart({ height = "h-64" }: { height?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-5 animate-pulse`}>
      <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
      <div className="h-3 w-24 bg-gray-100 rounded mb-4" />
      <div className={`${height} bg-gray-100 rounded-xl`} />
    </div>
  );
}

function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="p-5 space-y-3">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex gap-4 items-center animate-pulse">
            <div className="h-4 flex-1 bg-gray-100 rounded" />
            <div className="h-4 w-16 bg-gray-100 rounded" />
            <div className="h-4 w-12 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonSeoCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-pulse">
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
        <div className="h-4 w-40 bg-gray-200 rounded" />
      </div>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center space-y-2">
              <div className="h-6 w-12 bg-gray-200 rounded mx-auto" />
              <div className="h-3 w-16 bg-gray-100 rounded mx-auto" />
            </div>
          ))}
        </div>
        <div className="h-32 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

function SkeletonSiteDetail() {
  return (
    <>
      {/* Traffic KPI Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <SkeletonKpiCard key={i} />
        ))}
      </div>

      {/* Content KPI Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <SkeletonKpiCard key={i} />
        ))}
      </div>

      {/* Traffic Chart Skeleton */}
      <div className="mb-8">
        <SkeletonChart height="h-64" />
      </div>

      {/* SEO Skeleton */}
      <div className="mb-8">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonSeoCard />
          <SkeletonSeoCard />
        </div>
      </div>

      {/* Charts Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SkeletonChart height="h-72" />
        <SkeletonChart height="h-48" />
      </div>

      {/* Table Skeleton */}
      <div className="mb-8">
        <SkeletonTable rows={10} />
      </div>
    </>
  );
}

// --- Range Picker ---

const TIME_RANGES = [
  { label: "24h", hours: 24 },
  { label: "48h", hours: 48 },
  { label: "72h", hours: 72 },
  { label: "1W", hours: 168 },
  { label: "2W", hours: 336 },
  { label: "3W", hours: 504 },
  { label: "1M", hours: 720 },
];

function RangePicker({ active, onChange }: { active: number; onChange: (i: number) => void }) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-0.5">
      {TIME_RANGES.map((r, i) => (
        <button
          key={r.label}
          onClick={() => onChange(i)}
          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
            active === i
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

type TrafficApiStats = {
  pageviews: { value: number; prev: number };
  visitors: { value: number; prev: number };
  bounceRate: number;
  prevBounceRate: number;
  avgDuration: number;
  prevAvgDuration: number;
  affiliateClicks: number;
};

type TrafficApiReferrer = { name: string; count: number };

// --- Main Component ---

export default function SiteDetailDashboard({ siteSlug, siteName, siteDomain, hasUmami }: Props) {
  const [data, setData] = useState<SiteDetailData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Independent KPI range state
  const [kpiRange, setKpiRange] = useState(6); // default 1M
  const [kpiStats, setKpiStats] = useState<TrafficApiStats | null>(null);
  const [kpiLoading, setKpiLoading] = useState(false);

  // Independent Referrer range state
  const [refRange, setRefRange] = useState(6); // default 1M
  const [refReferrers, setRefReferrers] = useState<TrafficApiReferrer[]>([]);
  const [refLoading, setRefLoading] = useState(false);

  // Fetch KPI data for selected range
  const fetchKpiData = (rangeIndex: number) => {
    const hours = TIME_RANGES[rangeIndex].hours;
    setKpiLoading(true);
    fetch(`/api/admin/traffic?hours=${hours}&site=${encodeURIComponent(siteSlug)}`)
      .then((res) => res.json())
      .then((d) => {
        setKpiStats(d.stats ?? null);
        setKpiLoading(false);
      })
      .catch(() => setKpiLoading(false));
  };

  // Fetch referrer data for selected range
  const fetchRefData = (rangeIndex: number) => {
    const hours = TIME_RANGES[rangeIndex].hours;
    setRefLoading(true);
    fetch(`/api/admin/traffic?hours=${hours}&site=${encodeURIComponent(siteSlug)}`)
      .then((res) => res.json())
      .then((d) => {
        setRefReferrers(d.topReferrers ?? []);
        setRefLoading(false);
      })
      .catch(() => setRefLoading(false));
  };

  // Load initial KPI + Referrer data
  useEffect(() => {
    if (hasUmami) {
      fetchKpiData(kpiRange);
      fetchRefData(refRange);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteSlug, hasUmami]);

  useEffect(() => {
    fetch(`/api/admin/site-detail?site=${encodeURIComponent(siteSlug)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message));
  }, [siteSlug]);

  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl border border-red-200 p-6 text-center">
        <p className="text-sm text-red-600">Fehler beim Laden der Daten: {error}</p>
        <button
          onClick={() => {
            setError(null);
            fetch(`/api/admin/site-detail?site=${encodeURIComponent(siteSlug)}`)
              .then((res) => res.json())
              .then(setData)
              .catch((err) => setError(err.message));
          }}
          className="mt-3 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-5 h-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-gray-500">Daten werden geladen...</span>
        </div>
        <SkeletonSiteDetail />
      </div>
    );
  }

  const { kpis, scoreDistribution, topArticles, noFactCheck, freshnessData, umami, gsc, bing } = data;

  // Derived Umami data (for sections that still use initial load)
  const umamiStats = umami?.stats ?? null;
  const trafficChartData = umami?.trafficChart ?? [];
  const topPages = umami?.topPages ?? null;
  const deviceChartData = umami?.devices
    ? umami.devices.map((d) => ({ name: d.x, value: d.y }))
    : [];
  const affiliateBoxClicks = umami?.events?.find((e) => e.x === "affiliate-box-click")?.y ?? 0;
  const affiliateLinkClicks = umami?.events?.find((e) => e.x === "affiliate-link-click")?.y ?? 0;

  return (
    <>
      {/* Traffic KPI Cards (Umami) - with independent range picker */}
      {hasUmami ? (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Traffic KPIs</h2>
            <RangePicker
              active={kpiRange}
              onChange={(i) => {
                setKpiRange(i);
                fetchKpiData(i);
              }}
            />
          </div>
          {kpiStats ? (
            <div
              className={`grid grid-cols-2 sm:grid-cols-4 gap-4 transition-opacity duration-300 ${
                kpiLoading ? "opacity-50" : "opacity-100"
              }`}
            >
              <TrafficKpiCard
                label="Pageviews"
                value={fmt(kpiStats.pageviews.value)}
                delta={<DeltaIndicator value={kpiStats.pageviews.value} prev={kpiStats.pageviews.prev} />}
                icon="pageviews"
              />
              <TrafficKpiCard
                label="Besucher"
                value={fmt(kpiStats.visitors.value)}
                delta={<DeltaIndicator value={kpiStats.visitors.value} prev={kpiStats.visitors.prev} />}
                icon="visitors"
              />
              <TrafficKpiCard
                label="Bounce Rate"
                value={`${kpiStats.bounceRate}%`}
                delta={<DeltaIndicator value={kpiStats.bounceRate} prev={kpiStats.prevBounceRate} invert />}
                icon="bounce"
              />
              <TrafficKpiCard
                label="Avg. Besuchsdauer"
                value={formatDuration(kpiStats.avgDuration)}
                delta={<DeltaIndicator value={kpiStats.avgDuration} prev={kpiStats.prevAvgDuration} />}
                icon="duration"
              />
            </div>
          ) : kpiLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <SkeletonKpiCard key={i} />
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 mb-6 text-center text-sm text-gray-400">
          Umami nicht konfiguriert -- setze UMAMI_API_USER und UMAMI_API_PASSWORD in Vercel
        </div>
      )}

      {/* Content KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Artikel" value={kpis.articles} accent="blue" icon="articles" />
        <KpiCard label="Score (Avg)" value={kpis.avgScore} accent="purple" icon="score" sub="von 100" />
        <KpiCard label="Affiliate-Klicks" value={kpis.clicks} accent="amber" icon="clicks" sub="diesen Monat" />
        <KpiCard label="Bilder" value={kpis.images} accent="green" icon="images" href={`/admin/media?site=${siteSlug}`} />
      </div>

      {/* Interactive Traffic Chart */}
      {hasUmami && (
        <div className="mb-8">
          <InteractiveTraffic
            siteSlug={siteSlug}
            initialData={trafficChartData}
          />
        </div>
      )}

      {/* SEO & Suchmaschinen */}
      {(gsc || bing) ? (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
            SEO &amp; Suchmaschinen
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Google Search Console */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-blue-50/60 border-b border-blue-100">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <h3 className="text-sm font-semibold text-gray-800">Google Search Console</h3>
                  <a
                    href={`https://search.google.com/search-console?resource_id=sc-domain%3A${siteDomain.replace(/^www\./, "")}&hl=de`}
                    target="_blank"
                    rel="noopener"
                    className="text-xs text-blue-500 hover:text-blue-700 ml-auto flex items-center gap-1 transition-colors"
                  >
                    GSC öffnen
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                  </a>
                </div>
              </div>
              {gsc ? (
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900 tabular-nums">{fmt(gsc.totalClicks)}</p>
                      <p className="text-xs text-gray-400">Klicks</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900 tabular-nums">{fmt(gsc.totalImpressions)}</p>
                      <p className="text-xs text-gray-400">Impressionen</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900 tabular-nums">{gsc.avgCtr}%</p>
                      <p className="text-xs text-gray-400">CTR</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900 tabular-nums">{gsc.avgPosition}</p>
                      <p className="text-xs text-gray-400">Avg. Position</p>
                    </div>
                  </div>
                  {gsc.dailyTrend.length > 0 && <GscTrendChart data={gsc.dailyTrend} />}
                  {gsc.topQueries.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Top Suchanfragen</h4>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-left text-gray-400">
                            <th className="pb-1.5 font-medium">Query</th>
                            <th className="pb-1.5 font-medium text-right">Klicks</th>
                            <th className="pb-1.5 font-medium text-right">Impr.</th>
                            <th className="pb-1.5 font-medium text-right">Pos.</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {gsc.topQueries.map((q) => (
                            <tr key={q.query} className="hover:bg-gray-50/50">
                              <td className="py-1.5 text-gray-700 truncate max-w-[180px]">{q.query}</td>
                              <td className="py-1.5 text-right text-gray-900 font-medium tabular-nums">{q.clicks}</td>
                              <td className="py-1.5 text-right text-gray-500 tabular-nums">{fmt(q.impressions)}</td>
                              <td className="py-1.5 text-right">
                                <PositionBadge position={q.position} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-gray-400">
                  Nicht konfiguriert -- setze GSC_CLIENT_ID, GSC_CLIENT_SECRET und GSC_REFRESH_TOKEN
                </div>
              )}
            </div>

            {/* Bing Webmaster Tools */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-teal-50/60 border-b border-teal-100">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M4.5 2v16.8l3.7 2.2 8-3.8v-4.3L10.5 16l-2.5-1.5V5.5l-3.5-1z" fill="#008373"/>
                    <path d="M10.5 5.5v9l5.7 3.3 3.3-1.5v-6.1L10.5 5.5z" fill="#00B294"/>
                  </svg>
                  <h3 className="text-sm font-semibold text-gray-800">Bing Webmaster</h3>
                  <a
                    href={`https://www.bing.com/webmasters/home?siteUrl=https://${siteDomain}/`}
                    target="_blank"
                    rel="noopener"
                    className="text-xs text-teal-500 hover:text-teal-700 ml-auto flex items-center gap-1 transition-colors"
                  >
                    BWT öffnen
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                  </a>
                </div>
              </div>
              {bing ? (
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900 tabular-nums">{fmt(bing.inIndex)}</p>
                      <p className="text-xs text-gray-400">Indexiert</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900 tabular-nums">{fmt(bing.crawledToday)}</p>
                      <p className="text-xs text-gray-400">Gecrawlt Heute</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-lg font-bold tabular-nums ${bing.crawlErrors > 0 ? "text-red-600" : "text-gray-900"}`}>
                        {fmt(bing.crawlErrors)}
                      </p>
                      <p className="text-xs text-gray-400">Fehler</p>
                    </div>
                  </div>
                  {bing.indexTrend.length > 0 && <BingIndexChart data={bing.indexTrend} />}
                  {bing.topQueries.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Top Suchanfragen</h4>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-left text-gray-400">
                            <th className="pb-1.5 font-medium">Query</th>
                            <th className="pb-1.5 font-medium text-right">Klicks</th>
                            <th className="pb-1.5 font-medium text-right">Impr.</th>
                            <th className="pb-1.5 font-medium text-right">Pos.</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {bing.topQueries.map((q) => (
                            <tr key={q.query} className="hover:bg-gray-50/50">
                              <td className="py-1.5 text-gray-700 truncate max-w-[180px]">{q.query}</td>
                              <td className="py-1.5 text-right text-gray-900 font-medium tabular-nums">{q.clicks}</td>
                              <td className="py-1.5 text-right text-gray-500 tabular-nums">{fmt(q.impressions)}</td>
                              <td className="py-1.5 text-right">
                                <PositionBadge position={q.position} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-gray-400">
                  Nicht konfiguriert -- setze BING_WEBMASTER_API_KEY
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 mb-8 text-center text-sm text-gray-400">
          SEO-Daten nicht verfügbar – GSC und Bing Webmaster nicht konfiguriert
        </div>
      )}

      {/* Referrers + Devices + Affiliate Events Row */}
      {hasUmami && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-semibold text-gray-900">Top Referrer</h2>
            </div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-400">{TIME_RANGES[refRange].label}</p>
              <RangePicker
                active={refRange}
                onChange={(i) => {
                  setRefRange(i);
                  fetchRefData(i);
                }}
              />
            </div>
            <div className={`transition-opacity duration-300 ${refLoading ? "opacity-50" : "opacity-100"}`}>
              {refReferrers.length > 0 ? (
                <div className="space-y-2">
                  {refReferrers.slice(0, 10).map((ref, i) => {
                    const maxCount = refReferrers[0]?.count || 1;
                    return (
                      <div key={ref.name} className="flex items-center gap-2 text-sm">
                        <span className="text-xs text-gray-400 w-4 text-right tabular-nums">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="relative h-6 flex items-center">
                                <div
                                  className="absolute inset-y-0 left-0 bg-blue-100 rounded"
                                  style={{ width: `${(ref.count / maxCount) * 100}%` }}
                                />
                                <span className="relative z-10 px-2 text-xs text-gray-700 truncate">{ref.name}</span>
                              </div>
                            </div>
                            <span className="text-xs font-medium text-gray-900 tabular-nums shrink-0">{fmt(ref.count)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : refLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 py-8 text-center">Keine Referrer-Daten</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Geräte</h2>
            <p className="text-xs text-gray-400 mb-3">Letzte 30 Tage</p>
            {deviceChartData.length > 0 ? (
              <div className="flex items-center justify-center pt-4">
                <DeviceChart data={deviceChartData} />
              </div>
            ) : (
              <p className="text-sm text-gray-400 py-8 text-center">Keine Gerätedaten</p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Affiliate Events</h2>
            <p className="text-xs text-gray-400 mb-3">Letzte 30 Tage (Umami)</p>
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-700">Box-Klicks</p>
                  <p className="text-xs text-gray-400 mt-0.5">affiliate-box-click</p>
                </div>
                <span className="text-2xl font-bold text-amber-600 tabular-nums">
                  {affiliateBoxClicks}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-700">Link-Klicks</p>
                  <p className="text-xs text-gray-400 mt-0.5">affiliate-link-click</p>
                </div>
                <span className="text-2xl font-bold text-blue-600 tabular-nums">
                  {affiliateLinkClicks}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Pages Table */}
      {topPages && topPages.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Top Seiten (Pageviews)</h2>
            <p className="text-xs text-gray-400 mt-0.5">Letzte 30 Tage</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80 text-left">
                <tr>
                  <th className="px-5 py-3 font-medium text-gray-600">URL</th>
                  <th className="px-5 py-3 font-medium text-gray-600 text-right w-32">Pageviews</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topPages.slice(0, 10).map((page) => (
                  <tr key={page.x} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 text-gray-700 font-mono text-xs truncate max-w-md">
                      {page.x}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-900 font-semibold tabular-nums">
                      {fmt(page.y)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-1">
            Score-Verteilung
          </h2>
          <p className="text-xs text-gray-400 mb-3">{kpis.scoredCount} Artikel mit Score</p>
          <ScoreChart data={scoreDistribution} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-1">
            Artikel-Frische
          </h2>
          <p className="text-xs text-gray-400 mb-3">Alter des letzten Faktenchecks</p>
          <FreshnessChart data={freshnessData} total={kpis.articles} />
        </div>
      </div>

      {/* Top Articles */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            Top 10 Artikel (nach Score)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/80 text-left">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-600">Titel</th>
                <th className="px-5 py-3 font-medium text-gray-600 text-center w-36">Score</th>
                <th className="px-5 py-3 font-medium text-gray-600">
                  Letzter Faktencheck
                </th>
                <th className="px-5 py-3 font-medium text-gray-600 text-center">
                  Featured
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topArticles.map((article) => (
                <tr key={article.slug} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 text-gray-900 max-w-xs truncate">
                    {article.title}
                  </td>
                  <td className="px-5 py-3">
                    <InlineScoreBar score={article.score} />
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {article.lastFactCheck || (
                      <span className="inline-flex items-center gap-1.5 text-red-500">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                        </span>
                        nie
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {article.featured ? (
                      <span className="text-emerald-600 font-medium">Ja</span>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Articles without Fact Check */}
      {noFactCheck.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
              <h2 className="text-base font-semibold text-amber-800">
                Ohne Faktencheck ({noFactCheck.length})
              </h2>
            </div>
          </div>
          <ul className="divide-y divide-gray-100">
            {noFactCheck.slice(0, 20).map((article) => (
              <li
                key={article.slug}
                className="px-5 py-3 flex items-center justify-between hover:bg-amber-50/30 transition-colors"
              >
                <span className="text-sm text-gray-700 truncate max-w-md">
                  {article.title}
                </span>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <InlineScoreBar score={article.score} compact />
                  <span className="text-xs text-gray-400 font-mono">
                    {article.slug}
                  </span>
                </div>
              </li>
            ))}
            {noFactCheck.length > 20 && (
              <li className="px-5 py-3 text-sm text-gray-500">
                ... und {noFactCheck.length - 20} weitere
              </li>
            )}
          </ul>
        </div>
      )}
    </>
  );
}

// --- Helper Components ---

function DeltaIndicator({ value, prev, invert }: { value: number; prev: number; invert?: boolean }) {
  if (prev === 0) return null;
  const diff = value - prev;
  const pct = Math.round((diff / prev) * 100);
  if (pct === 0) return null;

  const isPositive = invert ? pct < 0 : pct > 0;
  const isNegative = invert ? pct > 0 : pct < 0;

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        isPositive ? "text-emerald-600" : isNegative ? "text-red-500" : "text-gray-400"
      }`}
    >
      {pct > 0 ? (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
        </svg>
      ) : (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />
        </svg>
      )}
      {Math.abs(pct)}%
    </span>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${secs}s`;
}

function TrafficKpiCard({
  label,
  value,
  delta,
  icon,
}: {
  label: string;
  value: string;
  delta: React.ReactNode;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <TrafficKpiIcon icon={icon} />
      </div>
      <p className="text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
      <div className="mt-1">{delta}</div>
    </div>
  );
}

function TrafficKpiIcon({ icon }: { icon: string }) {
  const cls = "w-4 h-4 text-gray-400";
  switch (icon) {
    case "pageviews":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case "visitors":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      );
    case "bounce":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
        </svg>
      );
    case "duration":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return null;
  }
}

const ACCENT_STYLES = {
  blue: "border-l-blue-500 group-hover:bg-blue-50/50",
  green: "border-l-emerald-500 group-hover:bg-emerald-50/50",
  amber: "border-l-amber-500 group-hover:bg-amber-50/50",
  purple: "border-l-purple-500 group-hover:bg-purple-50/50",
};

const ACCENT_ICON_STYLES = {
  blue: "text-blue-500 bg-blue-50",
  green: "text-emerald-500 bg-emerald-50",
  amber: "text-amber-500 bg-amber-50",
  purple: "text-purple-500 bg-purple-50",
};

function KpiCard({
  label,
  value,
  accent,
  icon,
  sub,
  href,
}: {
  label: string;
  value: number;
  accent: "blue" | "green" | "amber" | "purple";
  icon: string;
  sub?: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-2 text-3xl font-bold text-gray-900 tabular-nums">
          {fmt(value)}
        </p>
        {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ACCENT_ICON_STYLES[accent]}`}>
        <KpiIcon icon={icon} />
      </div>
    </div>
  );

  const cls = `group bg-white rounded-2xl border border-gray-200 shadow-sm border-l-4 p-5 transition-all duration-300 hover:shadow-md ${ACCENT_STYLES[accent]} ${href ? "cursor-pointer" : ""}`;

  if (href) {
    return <Link href={href} className={cls}>{content}</Link>;
  }
  return <div className={cls}>{content}</div>;
}

function KpiIcon({ icon }: { icon: string }) {
  const cls = "w-5 h-5";
  switch (icon) {
    case "articles":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      );
    case "images":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
        </svg>
      );
    case "clicks":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
        </svg>
      );
    case "score":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      );
    default:
      return null;
  }
}

function PositionBadge({ position }: { position: number }) {
  let cls = "bg-red-100 text-red-700";
  if (position > 0 && position < 5) cls = "bg-emerald-100 text-emerald-700";
  else if (position < 10) cls = "bg-amber-100 text-amber-700";
  return (
    <span className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-xs font-medium tabular-nums ${cls}`}>
      {position}
    </span>
  );
}

function InlineScoreBar({ score, compact }: { score: number; compact?: boolean }) {
  let barColor = "bg-gray-300";
  let textColor = "text-gray-500";
  if (score >= 60) {
    barColor = "bg-emerald-500";
    textColor = "text-emerald-700";
  } else if (score >= 30) {
    barColor = "bg-amber-500";
    textColor = "text-amber-700";
  } else if (score > 0) {
    barColor = "bg-red-500";
    textColor = "text-red-700";
  }

  return (
    <div className={`flex items-center gap-2 ${compact ? "" : "justify-center"}`}>
      <div className={`${compact ? "w-12" : "w-16"} h-1.5 bg-gray-100 rounded-full overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      <span className={`text-xs font-semibold tabular-nums ${textColor}`}>{score}</span>
    </div>
  );
}
