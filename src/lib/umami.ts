// Umami Analytics API Client
// Docs: https://umami.is/docs/api

const UMAMI_URL = process.env.UMAMI_URL;
const UMAMI_USER = process.env.UMAMI_API_USER;
const UMAMI_PASS = process.env.UMAMI_API_PASSWORD;

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string | null> {
  if (!UMAMI_URL || !UMAMI_USER || !UMAMI_PASS) return null;

  // Return cached token if still valid (1h buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 3600_000) {
    return cachedToken.token;
  }

  try {
    const res = await fetch(`${UMAMI_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: UMAMI_USER, password: UMAMI_PASS }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const token = data.token;
    if (!token) return null;

    // Cache for 24h (Umami tokens last longer)
    cachedToken = { token, expiresAt: Date.now() + 86400_000 };
    return token;
  } catch {
    return null;
  }
}

async function umamiGet<T>(path: string): Promise<T | null> {
  const token = await getToken();
  if (!token || !UMAMI_URL) return null;

  try {
    const res = await fetch(`${UMAMI_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 300 }, // Cache 5 min
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// --- Public API ---

// Raw format from Umami API v2.12+
type UmamiStatsRaw = {
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
  comparison: {
    pageviews: number;
    visitors: number;
    visits: number;
    bounces: number;
    totaltime: number;
  };
};

// Normalized format used by our dashboard
export type UmamiStats = {
  pageviews: { value: number; prev: number };
  visitors: { value: number; prev: number };
  visits: { value: number; prev: number };
  bounces: { value: number; prev: number };
  totaltime: { value: number; prev: number };
};

function normalizeStats(raw: UmamiStatsRaw): UmamiStats {
  const c = raw.comparison || { pageviews: 0, visitors: 0, visits: 0, bounces: 0, totaltime: 0 };
  return {
    pageviews: { value: raw.pageviews ?? 0, prev: c.pageviews ?? 0 },
    visitors: { value: raw.visitors ?? 0, prev: c.visitors ?? 0 },
    visits: { value: raw.visits ?? 0, prev: c.visits ?? 0 },
    bounces: { value: raw.bounces ?? 0, prev: c.bounces ?? 0 },
    totaltime: { value: raw.totaltime ?? 0, prev: c.totaltime ?? 0 },
  };
}

export type UmamiPageview = {
  x: string; // date string
  y: number; // count
};

export type UmamiMetric = {
  x: string; // name (URL, referrer, etc.)
  y: number; // count
};

function dateRange(days: number) {
  const endAt = Date.now();
  const startAt = endAt - days * 86400_000;
  return `startAt=${startAt}&endAt=${endAt}`;
}

function hoursRange(hours: number) {
  const endAt = Date.now();
  const startAt = endAt - hours * 3600_000;
  return `startAt=${startAt}&endAt=${endAt}`;
}

// Flexible time range with auto unit selection
export async function getPageviewsForRange(
  websiteId: string,
  hours: number
): Promise<{ pageviews: UmamiPageview[]; sessions: UmamiPageview[] } | null> {
  const unit = hours <= 72 ? "hour" : "day";
  const range = hours <= 72 ? hoursRange(hours) : dateRange(Math.ceil(hours / 24));
  return umamiGet(`/api/websites/${websiteId}/pageviews?unit=${unit}&${range}`);
}

export async function getStatsForRange(
  websiteId: string,
  hours: number
): Promise<UmamiStats | null> {
  const range = hours <= 72 ? hoursRange(hours) : dateRange(Math.ceil(hours / 24));
  const raw = await umamiGet<UmamiStatsRaw>(`/api/websites/${websiteId}/stats?${range}`);
  return raw ? normalizeStats(raw) : null;
}

export async function getStats(websiteId: string, days = 30): Promise<UmamiStats | null> {
  const raw = await umamiGet<UmamiStatsRaw>(`/api/websites/${websiteId}/stats?${dateRange(days)}`);
  return raw ? normalizeStats(raw) : null;
}

export async function getPageviews(
  websiteId: string,
  days = 30,
  unit = "day"
): Promise<{ pageviews: UmamiPageview[]; sessions: UmamiPageview[] } | null> {
  return umamiGet(`/api/websites/${websiteId}/pageviews?unit=${unit}&${dateRange(days)}`);
}

export async function getTopPages(websiteId: string, days = 30, limit = 10): Promise<UmamiMetric[] | null> {
  return umamiGet(`/api/websites/${websiteId}/metrics?type=url&${dateRange(days)}&limit=${limit}`);
}

export async function getTopReferrers(websiteId: string, days = 30, limit = 10): Promise<UmamiMetric[] | null> {
  return umamiGet(`/api/websites/${websiteId}/metrics?type=referrer&${dateRange(days)}&limit=${limit}`);
}

export async function getTopReferrersForRange(websiteId: string, hours: number, limit = 10): Promise<UmamiMetric[] | null> {
  const range = hours <= 72 ? hoursRange(hours) : dateRange(Math.ceil(hours / 24));
  return umamiGet(`/api/websites/${websiteId}/metrics?type=referrer&${range}&limit=${limit}`);
}

export async function getTopCountries(websiteId: string, days = 30, limit = 10): Promise<UmamiMetric[] | null> {
  return umamiGet(`/api/websites/${websiteId}/metrics?type=country&${dateRange(days)}&limit=${limit}`);
}

export async function getTopDevices(websiteId: string, days = 30): Promise<UmamiMetric[] | null> {
  return umamiGet(`/api/websites/${websiteId}/metrics?type=device&${dateRange(days)}&limit=5`);
}

export async function getEvents(websiteId: string, days = 30): Promise<UmamiMetric[] | null> {
  return umamiGet(`/api/websites/${websiteId}/metrics?type=event&${dateRange(days)}&limit=20`);
}

// Aggregate stats across multiple websites
export async function getAggregateStats(
  websiteIds: string[],
  days = 30
): Promise<{ pageviews: number; visitors: number; visits: number; bounceRate: number } | null> {
  const results = await Promise.all(websiteIds.map((id) => getStats(id, days)));

  let pageviews = 0;
  let visitors = 0;
  let visits = 0;
  let bounces = 0;

  for (const stats of results) {
    if (!stats) continue;
    pageviews += stats.pageviews.value;
    visitors += stats.visitors.value;
    visits += stats.visits.value;
    bounces += stats.bounces.value;
  }

  const bounceRate = visits > 0 ? Math.round((bounces / visits) * 100) : 0;

  return { pageviews, visitors, visits, bounceRate };
}
