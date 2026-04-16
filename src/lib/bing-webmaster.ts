// Bing Webmaster Tools API Client
// Docs: https://learn.microsoft.com/en-us/dotnet/api/microsoft.bing.webmaster.api

const API_BASE = "https://ssl.bing.com/webmaster/api.svc/json";
const API_KEY = process.env.BING_WEBMASTER_API_KEY;

async function bingGet<T>(endpoint: string, siteUrl: string): Promise<T | null> {
  if (!API_KEY) return null;
  try {
    const encodedSite = encodeURIComponent(siteUrl);
    const res = await fetch(
      `${API_BASE}/${endpoint}?siteUrl=${encodedSite}&apikey=${API_KEY}`,
      { next: { revalidate: 7200 } } // Cache 2h
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.d ?? data;
  } catch {
    return null;
  }
}

// --- Types ---

export type BingCrawlStats = {
  Date: string;
  CrawledPages: number;
  InIndex: number;
  Code2xx: number;
  Code4xx: number;
  Code5xx: number;
  CrawlErrors: number;
};

export type BingQueryStats = {
  Query: string;
  Impressions: number;
  Clicks: number;
  AvgImpressionPosition: number;
  Date: string;
};

export type BingPageStats = {
  Query: string; // actually the URL
  Impressions: number;
  Clicks: number;
  AvgImpressionPosition: number;
  Date: string;
};

// --- Public API ---

export async function getCrawlStats(siteUrl: string): Promise<BingCrawlStats[] | null> {
  return bingGet("GetCrawlStats", siteUrl);
}

export async function getQueryStats(siteUrl: string): Promise<BingQueryStats[] | null> {
  return bingGet("GetQueryStats", siteUrl);
}

export async function getPageStats(siteUrl: string): Promise<BingPageStats[] | null> {
  return bingGet("GetPageStats", siteUrl);
}

// --- Aggregated helpers ---

export type BingSiteSummary = {
  inIndex: number;
  crawledToday: number;
  crawlErrors: number;
  totalClicks: number;
  totalImpressions: number;
  topQueries: { query: string; clicks: number; impressions: number; position: number }[];
  indexTrend: { date: string; inIndex: number }[];
};

export async function getSiteSummary(siteUrl: string): Promise<BingSiteSummary | null> {
  const [crawlStats, queryStats] = await Promise.all([
    getCrawlStats(siteUrl),
    getQueryStats(siteUrl),
  ]);

  if (!crawlStats || crawlStats.length === 0) return null;

  // Latest crawl stats
  const latest = crawlStats[crawlStats.length - 1];

  // Aggregate query stats
  const queryMap = new Map<string, { clicks: number; impressions: number; positions: number[]; }>();
  for (const q of queryStats || []) {
    const existing = queryMap.get(q.Query) || { clicks: 0, impressions: 0, positions: [] };
    existing.clicks += q.Clicks;
    existing.impressions += q.Impressions;
    if (q.AvgImpressionPosition > 0) existing.positions.push(q.AvgImpressionPosition);
    queryMap.set(q.Query, existing);
  }

  const topQueries = Array.from(queryMap.entries())
    .map(([query, data]) => ({
      query,
      clicks: data.clicks,
      impressions: data.impressions,
      position: data.positions.length > 0
        ? Math.round(data.positions.reduce((a, b) => a + b, 0) / data.positions.length)
        : 0,
    }))
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 10);

  let totalClicks = 0;
  let totalImpressions = 0;
  for (const q of topQueries) {
    totalClicks += q.clicks;
    totalImpressions += q.impressions;
  }

  // Index trend (last 14 data points)
  const indexTrend = crawlStats.slice(-14).map((cs) => ({
    date: cs.Date,
    inIndex: cs.InIndex,
  }));

  return {
    inIndex: latest.InIndex,
    crawledToday: latest.CrawledPages,
    crawlErrors: latest.CrawlErrors,
    totalClicks,
    totalImpressions,
    topQueries,
    indexTrend,
  };
}
