"use client";

function fmt(n: number | null | undefined): string {
  return (n ?? 0).toLocaleString("de-DE");
}

import { useState, useEffect } from "react";
import Link from "next/link";
import OverviewCharts from "./OverviewCharts";
import OverviewKpis from "./OverviewKpis";
import ActionButton from "./ActionButton";
import AwinWidget from "./AwinWidget";

// --- Types ---

type SiteRow = {
  slug: string;
  domain: string;
  themePreset: string;
  articleCount: number;
  avgScore: number;
  clicksThisMonth: number;
  imageCount: number;
  pageviews: number;
  visitors: number;
};

type RecentArticle = {
  slug: string;
  title: string;
  site: string;
  siteDomain: string;
  lastFactCheck: string;
  score: number;
};

type OverviewData = {
  sites: SiteRow[];
  totals: {
    articles: number;
    images: number;
    clicksThisMonth: number;
    avgScore: number;
    pageviews: number;
    visitors: number;
    bounceRate: number;
  };
  recentArticles: RecentArticle[];
  scoreHeatmap: {
    data: { site: string; domain: string; ranges: number[] }[];
    ranges: string[];
  };
  articleDistribution: { name: string; value: number; color: string }[];
  trafficChart: { date: string; pageviews: number; visitors: number }[];
  cronSecret: string;
};

const SITE_COLORS: Record<string, string> = {
  blue: "#3b82f6",
  rose: "#f43f5e",
  teal: "#14b8a6",
  coral: "#f97316",
  amber: "#f59e0b",
  emerald: "#10b981",
};

// --- Skeleton Components ---

function SkeletonKpiCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm border-l-4 border-l-gray-200 p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="w-10 h-10 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

function SkeletonChart({ height = "h-64" }: { height?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-5 ${height} animate-pulse`}>
      <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
      <div className="h-full bg-gray-100 rounded-xl" />
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="p-5 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            <div className="h-4 flex-1 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-12 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonOverview() {
  return (
    <>
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[...Array(6)].map((_, i) => (
          <SkeletonKpiCard key={i} />
        ))}
      </div>

      {/* Traffic Chart Skeleton */}
      <div className="mb-8">
        <SkeletonChart height="h-80" />
      </div>

      {/* Charts Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SkeletonChart height="h-96" />
        <SkeletonChart height="h-96" />
      </div>

      {/* Table Skeleton */}
      <div className="mb-8">
        <SkeletonTable />
      </div>

      {/* Recent Activity Skeleton */}
      <div className="mb-8">
        <SkeletonTable />
      </div>
    </>
  );
}

// --- Main Component ---

export default function OverviewDashboard() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl border border-red-200 p-6 text-center">
        <p className="text-sm text-red-600">Fehler beim Laden der Daten: {error}</p>
        <button
          onClick={() => {
            setError(null);
            fetch("/api/admin/overview")
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
          <span className="text-sm text-gray-500">Dashboard wird geladen...</span>
        </div>
        <SkeletonOverview />
      </div>
    );
  }

  const { sites, totals, recentArticles, scoreHeatmap, articleDistribution, trafficChart, cronSecret } = data;

  return (
    <>
      {/* KPI Cards + Time Range Picker + Chart */}
      <OverviewKpis
        articles={totals.articles}
        images={totals.images}
        avgScore={totals.avgScore}
        initialChartData={trafficChart}
      />

      {/* Site Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Sites</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/80 text-left">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-600">Site</th>
                <th className="px-5 py-3 font-medium text-gray-600">Domain</th>
                <th className="px-5 py-3 font-medium text-gray-600 text-right">Artikel</th>
                <th className="px-5 py-3 font-medium text-gray-600 text-right">Pageviews</th>
                <th className="px-5 py-3 font-medium text-gray-600 text-right">Besucher</th>
                <th className="px-5 py-3 font-medium text-gray-600 text-center">Score Avg</th>
                <th className="px-5 py-3 font-medium text-gray-600 text-right">Klicks/Monat</th>
                <th className="px-5 py-3 font-medium text-gray-600 text-right">Bilder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sites.map((row) => {
                const dotColor = SITE_COLORS[row.themePreset] || "#64748b";
                return (
                  <tr key={row.slug} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/site/${row.slug}`}
                        className="font-medium text-slate-800 hover:text-blue-600 flex items-center gap-2"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: dotColor }}
                        />
                        {row.slug}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{row.domain}</td>
                    <td className="px-5 py-3 text-right text-gray-700 font-medium">
                      {row.articleCount}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-700 tabular-nums">
                      {(row.pageviews ?? 0) > 0 ? fmt(row.pageviews) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-700 tabular-nums">
                      {(row.visitors ?? 0) > 0 ? fmt(row.visitors) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <ScoreBar score={row.avgScore} />
                    </td>
                    <td className="px-5 py-3 text-right text-gray-700">
                      {row.clicksThisMonth}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-700">
                      {row.imageCount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Awin Affiliate Widget */}
      <div className="mb-8">
        <AwinWidget />
      </div>

      {/* Charts Row */}
      <OverviewCharts
        pieData={articleDistribution}
        heatmapData={scoreHeatmap.data}
        scoreRanges={scoreHeatmap.ranges}
      />

      {/* Recent Activity */}
      {recentArticles.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Letzte Aktivitaet
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Zuletzt gepruefte Artikel</p>
          </div>
          <ul className="divide-y divide-gray-100">
            {recentArticles.map((article) => (
              <li
                key={`${article.site}-${article.slug}`}
                className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{article.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {article.siteDomain} &middot; Faktencheck: {article.lastFactCheck}
                  </p>
                </div>
                <ScoreBadge score={article.score} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Schnellaktionen
        </h2>
        <ActionButton
          label="Score Update + IndexNow"
          endpoint="/api/cron/update-scores"
          method="GET"
          cronSecret={cronSecret}
        />
      </div>
    </>
  );
}

// --- Helper Components (moved from server component) ---

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
  suffix,
}: {
  label: string;
  value: number;
  accent: "blue" | "green" | "amber" | "purple";
  icon: string;
  sub?: string;
  suffix?: string;
}) {
  return (
    <div
      className={`
        group bg-white rounded-2xl border border-gray-200 shadow-sm
        border-l-4 p-5 transition-all duration-300
        hover:shadow-md
        ${ACCENT_STYLES[accent]}
      `}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 tabular-nums">
            {fmt(value)}{suffix || ""}
          </p>
          {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ACCENT_ICON_STYLES[accent]}`}>
          <KpiIcon icon={icon} />
        </div>
      </div>
    </div>
  );
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
    default:
      return null;
  }
}

function ScoreBar({ score }: { score: number }) {
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
    <div className="flex items-center gap-2 justify-center">
      <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      <span className={`text-xs font-semibold tabular-nums ${textColor}`}>{score}</span>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  let color = "text-gray-500 bg-gray-100";
  if (score >= 60) color = "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200";
  else if (score >= 30) color = "text-amber-700 bg-amber-50 ring-1 ring-amber-200";
  else if (score > 0) color = "text-red-700 bg-red-50 ring-1 ring-red-200";

  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      {score}
    </span>
  );
}
