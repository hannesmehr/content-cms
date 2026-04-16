// Google Search Console API Client
// Uses OAuth2 with refresh token for server-side access

const GSC_CLIENT_ID = process.env.GSC_CLIENT_ID;
const GSC_CLIENT_SECRET = process.env.GSC_CLIENT_SECRET;
const GSC_REFRESH_TOKEN = process.env.GSC_REFRESH_TOKEN;

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  if (!GSC_CLIENT_ID || !GSC_CLIENT_SECRET || !GSC_REFRESH_TOKEN) return null;

  // Return cached token if still valid (5 min buffer)
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 300_000) {
    return cachedAccessToken.token;
  }

  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: GSC_CLIENT_ID,
        client_secret: GSC_CLIENT_SECRET,
        refresh_token: GSC_REFRESH_TOKEN,
        grant_type: "refresh_token",
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    cachedAccessToken = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
    };
    return data.access_token;
  } catch {
    return null;
  }
}

async function gscPost<T>(path: string, body: object): Promise<T | null> {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const res = await fetch(`https://www.googleapis.com/webmasters/v3${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      next: { revalidate: 7200 }, // Cache 2h
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// --- Types ---

export type GscRow = {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

type GscResponse = {
  rows?: GscRow[];
  responseAggregationType?: string;
};

// --- Public API ---

export async function getSearchAnalytics(
  siteUrl: string,
  options: {
    dimensions?: string[];
    startDate?: string;
    endDate?: string;
    rowLimit?: number;
  } = {}
): Promise<GscRow[] | null> {
  const {
    dimensions = ["query"],
    rowLimit = 20,
  } = options;

  // Default date range: last 28 days
  const endDate = options.endDate || new Date().toISOString().slice(0, 10);
  const startDate = options.startDate || new Date(Date.now() - 28 * 86400_000).toISOString().slice(0, 10);

  const encodedSite = encodeURIComponent(siteUrl);
  const result = await gscPost<GscResponse>(
    `/sites/${encodedSite}/searchAnalytics/query`,
    {
      startDate,
      endDate,
      dimensions,
      rowLimit,
      dataState: "all",
    }
  );

  return result?.rows ?? null;
}

// --- Aggregated helpers ---

export type GscSiteSummary = {
  totalClicks: number;
  totalImpressions: number;
  avgCtr: number;
  avgPosition: number;
  topQueries: { query: string; clicks: number; impressions: number; ctr: number; position: number }[];
  topPages: { page: string; clicks: number; impressions: number; position: number }[];
  dailyTrend: { date: string; clicks: number; impressions: number }[];
};

export async function getSiteSummary(siteUrl: string): Promise<GscSiteSummary | null> {
  const [queryData, pageData, dateData] = await Promise.all([
    getSearchAnalytics(siteUrl, { dimensions: ["query"], rowLimit: 10 }),
    getSearchAnalytics(siteUrl, { dimensions: ["page"], rowLimit: 10 }),
    getSearchAnalytics(siteUrl, { dimensions: ["date"], rowLimit: 28 }),
  ]);

  if (!queryData && !pageData && !dateData) return null;

  // Totals from date data
  let totalClicks = 0;
  let totalImpressions = 0;
  for (const row of dateData || []) {
    totalClicks += row.clicks;
    totalImpressions += row.impressions;
  }

  const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
  const avgPosition = dateData && dateData.length > 0
    ? dateData.reduce((sum, r) => sum + r.position, 0) / dateData.length
    : 0;

  const topQueries = (queryData || []).map((r) => ({
    query: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: Math.round(r.position * 10) / 10,
  }));

  const topPages = (pageData || []).map((r) => ({
    page: r.keys[0],
    clicks: r.clicks,
    impressions: r.impressions,
    position: Math.round(r.position * 10) / 10,
  }));

  const dailyTrend = (dateData || [])
    .map((r) => ({
      date: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalClicks,
    totalImpressions,
    avgCtr: Math.round(avgCtr * 1000) / 10, // percentage with 1 decimal
    avgPosition: Math.round(avgPosition * 10) / 10,
    topQueries,
    topPages,
    dailyTrend,
  };
}

// Helper to map site slug to GSC property URL
export function siteSlugToGscProperty(domain: string): string {
  // GSC uses sc-domain: format for domain properties
  const bare = domain.replace(/^www\./, "");
  return `sc-domain:${bare}`;
}
