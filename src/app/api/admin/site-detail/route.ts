import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { getSiteBySlug } from "@/lib/get-sites";
import { getPublishedArticles } from "@/lib/get-articles";
import { getAllClickData } from "@/lib/click-stats";
import {
  getStats,
  getPageviews,
  getTopPages,
  getTopReferrers,
  getTopDevices,
  getEvents,
} from "@/lib/umami";
import { getSiteSummary as getBingSummary } from "@/lib/bing-webmaster";
import { getSiteSummary as getGscSummary, siteSlugToGscProperty } from "@/lib/gsc";

export const dynamic = "force-dynamic";

function getRedis(): Redis | null {
  const url =
    process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function daysSince(dateStr: string | null): number {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

// Wraps a promise with a timeout (rejects after ms)
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms)
    ),
  ]);
}

export async function GET(request: NextRequest) {
  const siteSlug = request.nextUrl.searchParams.get("site");
  if (!siteSlug) {
    return NextResponse.json({ error: "Missing site parameter" }, { status: 400 });
  }

  try {
    const site = await getSiteBySlug(siteSlug);
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const articles = await getPublishedArticles(siteSlug);
    const redis = getRedis();

    // KPIs
    const articleCount = articles.length;
    const scores = articles.map((a) => a.score).filter((s) => s > 0);
    const avgScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

    // Affiliate clicks will be populated from Umami events
    let clicksThisMonth = 0;

    let imageCount = 0;
    if (redis) {
      try {
        imageCount = await redis.scard(`images:site:${siteSlug}`);
      } catch {
        // Redis unavailable
      }
    }

    // Score distribution
    const scoreDistribution = [
      { range: "0-20", count: 0 },
      { range: "21-40", count: 0 },
      { range: "41-60", count: 0 },
      { range: "61-80", count: 0 },
      { range: "81-100", count: 0 },
    ];
    for (const article of articles) {
      const s = article.score;
      if (s <= 20) scoreDistribution[0].count++;
      else if (s <= 40) scoreDistribution[1].count++;
      else if (s <= 60) scoreDistribution[2].count++;
      else if (s <= 80) scoreDistribution[3].count++;
      else scoreDistribution[4].count++;
    }

    // Article freshness data
    const freshnessData = [
      { label: "< 30 Tage", count: 0, color: "#22c55e" },
      { label: "30-90 Tage", count: 0, color: "#eab308" },
      { label: "90-180 Tage", count: 0, color: "#f97316" },
      { label: "> 180 Tage", count: 0, color: "#ef4444" },
      { label: "Nie geprueft", count: 0, color: "#94a3b8" },
    ];
    for (const article of articles) {
      const days = daysSince(article.lastFactCheck ?? null);
      if (days === Infinity) freshnessData[4].count++;
      else if (days < 30) freshnessData[0].count++;
      else if (days < 90) freshnessData[1].count++;
      else if (days < 180) freshnessData[2].count++;
      else freshnessData[3].count++;
    }

    // Top 10 by score
    const topArticles = [...articles]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((a) => ({
        slug: a.slug,
        title: a.title,
        score: a.score,
        lastFactCheck: a.lastFactCheck,
        featured: a.featured,
      }));

    // Articles without lastFactCheck
    const noFactCheck = articles
      .filter((a) => !a.lastFactCheck)
      .map((a) => ({
        slug: a.slug,
        title: a.title,
        score: a.score,
      }));

    // --- Umami data (parallel, safe) ---
    const umamiId = site.umamiWebsiteId || null;
    let umami: {
      stats: Awaited<ReturnType<typeof getStats>>;
      trafficChart: { date: string; pageviews: number; visitors: number }[];
      topPages: Awaited<ReturnType<typeof getTopPages>>;
      referrers: Awaited<ReturnType<typeof getTopReferrers>>;
      devices: Awaited<ReturnType<typeof getTopDevices>>;
      events: Awaited<ReturnType<typeof getEvents>>;
    } | null = null;

    if (umamiId) {
      try {
        const [umamiStats, pageviewData, topPages, topReferrers, deviceData, eventData] =
          await Promise.allSettled([
            getStats(umamiId),
            getPageviews(umamiId),
            getTopPages(umamiId),
            getTopReferrers(umamiId, 30, 5),
            getTopDevices(umamiId),
            getEvents(umamiId),
          ]);

        const stats = umamiStats.status === "fulfilled" ? umamiStats.value : null;
        const pvData = pageviewData.status === "fulfilled" ? pageviewData.value : null;
        const tp = topPages.status === "fulfilled" ? topPages.value : null;
        const tr = topReferrers.status === "fulfilled" ? topReferrers.value : null;
        const dd = deviceData.status === "fulfilled" ? deviceData.value : null;
        const ed = eventData.status === "fulfilled" ? eventData.value : null;

        const trafficChart = pvData
          ? pvData.pageviews.map((pv, i) => ({
              date: pv.x,
              pageviews: pv.y,
              visitors: pvData.sessions[i]?.y ?? 0,
            }))
          : [];

        umami = {
          stats,
          trafficChart,
          topPages: tp,
          referrers: tr,
          devices: dd,
          events: ed,
        };
      } catch {
        // Umami unavailable
      }
    }

    // Extract affiliate clicks from Umami events
    if (umami?.events) {
      const events = umami.events as any[];
      const boxClicks = events.find((e: any) => e.x === "affiliate-box-click")?.y ?? 0;
      const linkClicks = events.find((e: any) => e.x === "affiliate-link-click")?.y ?? 0;
      clicksThisMonth = boxClicks + linkClicks;
    }

    // --- SEO data (GSC + Bing) with 10s timeout ---
    const bingSiteUrl = `https://${site.domain}/`;
    const gscProperty = siteSlugToGscProperty(site.domain);

    const [gscResult, bingResult] = await Promise.allSettled([
      withTimeout(getGscSummary(gscProperty), 10000),
      withTimeout(getBingSummary(bingSiteUrl), 10000),
    ]);

    const gsc = gscResult.status === "fulfilled" ? gscResult.value : null;
    const bing = bingResult.status === "fulfilled" ? bingResult.value : null;

    return NextResponse.json({
      kpis: {
        articles: articleCount,
        avgScore,
        clicks: clicksThisMonth,
        images: imageCount,
        scoredCount: scores.length,
      },
      scoreDistribution,
      topArticles,
      noFactCheck,
      freshnessData,
      umami,
      gsc,
      bing,
    });
  } catch (error) {
    console.error("Site detail API error:", error);
    return NextResponse.json(
      { error: "Failed to load site detail data" },
      { status: 500 }
    );
  }
}
