import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { getAllSiteSlugs, getSiteBySlug } from "@/lib/get-sites";
import { getPublishedArticles } from "@/lib/get-articles";
import { getAllClickData } from "@/lib/click-stats";
import { getAggregateStats, getPageviews, getStats, getEvents } from "@/lib/umami";

export const dynamic = "force-dynamic";

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

const SITE_COLORS: Record<string, string> = {
  blue: "#3b82f6",
  rose: "#f43f5e",
  teal: "#14b8a6",
  coral: "#f97316",
  amber: "#f59e0b",
  emerald: "#10b981",
};

export async function GET() {
  try {
    const slugs = await getAllSiteSlugs();
    const { data: clickData } = await getAllClickData();
    const redis = getRedis();
    const currentMonth = getCurrentMonth();

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

    const siteRows: SiteRow[] = [];
    const recentArticles: RecentArticle[] = [];
    const pieData: { name: string; value: number; color: string }[] = [];

    const scoreRanges = ["0-20", "21-40", "41-60", "61-80", "81-100"];
    const heatmapData: { site: string; domain: string; ranges: number[] }[] = [];

    let totalArticles = 0;
    let totalImages = 0;
    let totalClicks = 0;
    let scoreSum = 0;
    let scoreCount = 0;

    const umamiIds: string[] = [];
    const siteUmamiMap: Record<string, string> = {};

    for (const siteSlug of slugs) {
      const site = await getSiteBySlug(siteSlug);
      if (!site || site.comingSoon) continue;

      if (site.umamiWebsiteId) {
        umamiIds.push(site.umamiWebsiteId);
        siteUmamiMap[siteSlug] = site.umamiWebsiteId;
      }

      const articles = await getPublishedArticles(siteSlug);
      const articleCount = articles.length;

      const scores = articles.map((a) => a.score).filter((s) => s > 0);
      const avgScore =
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0;

      // Affiliate clicks from Umami events (loaded later)
      let clicksThisMonth = 0;

      let imageCount = 0;
      if (redis) {
        try {
          imageCount = await redis.scard(`images:site:${siteSlug}`);
        } catch {
          // Redis not available
        }
      }

      siteRows.push({
        slug: siteSlug,
        domain: site.domain,
        themePreset: site.themePreset || "blue",
        articleCount,
        avgScore,
        clicksThisMonth,
        imageCount,
        pageviews: 0,
        visitors: 0,
      });

      pieData.push({
        name: site.domain.replace(/\.(de|com)$/, ""),
        value: articleCount,
        color: SITE_COLORS[site.themePreset || "blue"] || "#64748b",
      });

      const ranges = [0, 0, 0, 0, 0];
      for (const article of articles) {
        const s = article.score;
        if (s <= 20) ranges[0]++;
        else if (s <= 40) ranges[1]++;
        else if (s <= 60) ranges[2]++;
        else if (s <= 80) ranges[3]++;
        else ranges[4]++;
      }
      heatmapData.push({ site: siteSlug, domain: site.domain, ranges });

      for (const article of articles) {
        if (article.lastFactCheck) {
          recentArticles.push({
            slug: article.slug,
            title: article.title,
            site: siteSlug,
            siteDomain: site.domain,
            lastFactCheck: article.lastFactCheck,
            score: article.score,
          });
        }
      }

      totalArticles += articleCount;
      totalImages += imageCount;
      scoreSum += scores.reduce((a, b) => a + b, 0);
      scoreCount += scores.length;
    }

    const avgScoreTotal =
      scoreCount > 0 ? Math.round(scoreSum / scoreCount) : 0;

    // Sort recent articles by date, take 5
    const recentSorted = recentArticles
      .sort((a, b) => b.lastFactCheck.localeCompare(a.lastFactCheck))
      .slice(0, 5);

    // --- Umami data ---
    let aggregateStats: Awaited<ReturnType<typeof getAggregateStats>> = null;
    let sitePageviewResults: (Awaited<ReturnType<typeof getPageviews>> | null)[] = [];

    try {
      const [aggResult, ...pvResults] = await Promise.allSettled([
        umamiIds.length > 0 ? getAggregateStats(umamiIds) : Promise.resolve(null),
        ...Object.entries(siteUmamiMap).map(([, umamiId]) => getPageviews(umamiId)),
      ]);
      aggregateStats = aggResult.status === "fulfilled" ? aggResult.value : null;
      sitePageviewResults = pvResults.map((r) =>
        r.status === "fulfilled" ? r.value : null
      );
    } catch {
      // Umami completely unavailable
    }

    // Per-site stats for the table
    try {
      const perSiteStats = await Promise.allSettled(
        Object.entries(siteUmamiMap).map(async ([slug, umamiId]) => {
          const stats = await getStats(umamiId);
          return { slug, stats };
        })
      );
      for (const result of perSiteStats) {
        if (result.status !== "fulfilled") continue;
        const { slug, stats } = result.value;
        const row = siteRows.find((r) => r.slug === slug);
        if (row && stats) {
          row.pageviews = stats.pageviews?.value ?? 0;
          row.visitors = stats.visitors?.value ?? 0;
        }
      }
    } catch {
      // Ignore
    }

    // Affiliate clicks from Umami events
    try {
      const eventResults = await Promise.allSettled(
        Object.entries(siteUmamiMap).map(async ([slug, umamiId]) => {
          const events = await getEvents(umamiId);
          return { slug, events };
        })
      );
      for (const result of eventResults) {
        if (result.status !== "fulfilled") continue;
        const { slug, events } = result.value;
        if (!events) continue;
        const boxClicks = events.find((e) => e.x === "affiliate-box-click")?.y ?? 0;
        const linkClicks = events.find((e) => e.x === "affiliate-link-click")?.y ?? 0;
        const row = siteRows.find((r) => r.slug === slug);
        if (row) {
          row.clicksThisMonth = boxClicks + linkClicks;
        }
      }
    } catch {
      // Ignore
    }

    // Total clicks from Umami events (sum across all sites, AFTER events are loaded)
    totalClicks = siteRows.reduce((sum, row) => sum + row.clicksThisMonth, 0);

    // Aggregate pageview chart data
    const dayMap: Record<string, { pageviews: number; visitors: number }> = {};
    const siteUmamiEntries = Object.entries(siteUmamiMap);
    for (let i = 0; i < siteUmamiEntries.length; i++) {
      const pvData = sitePageviewResults[i];
      if (!pvData) continue;
      for (const pv of pvData.pageviews) {
        if (!dayMap[pv.x]) dayMap[pv.x] = { pageviews: 0, visitors: 0 };
        dayMap[pv.x].pageviews += pv.y;
      }
      for (const s of pvData.sessions) {
        if (!dayMap[s.x]) dayMap[s.x] = { pageviews: 0, visitors: 0 };
        dayMap[s.x].visitors += s.y;
      }
    }
    const trafficChartData = Object.entries(dayMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, vals]) => ({ date, ...vals }));

    return NextResponse.json({
      sites: siteRows,
      totals: {
        articles: totalArticles,
        images: totalImages,
        clicksThisMonth: totalClicks,
        avgScore: avgScoreTotal,
        pageviews: aggregateStats?.pageviews ?? 0,
        visitors: aggregateStats?.visitors ?? 0,
        bounceRate: aggregateStats?.bounceRate ?? 0,
      },
      recentArticles: recentSorted,
      scoreHeatmap: { data: heatmapData, ranges: scoreRanges },
      articleDistribution: pieData,
      trafficChart: trafficChartData,
      cronSecret: process.env.CRON_SECRET || "",
    });
  } catch (error) {
    console.error("Overview API error:", error);
    return NextResponse.json(
      { error: "Failed to load overview data" },
      { status: 500 }
    );
  }
}
