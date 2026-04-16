import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { getAllSiteSlugs, getSiteBySlug } from "@/lib/get-sites";
import { getPublishedArticles } from "@/lib/get-articles";
import { getAllClickData } from "@/lib/click-stats";

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

export async function GET(request: Request) {
  // Auth check
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redis = getRedis();
  const slugs = await getAllSiteSlugs();
  const { data: clickData } = await getAllClickData();
  const currentMonth = getCurrentMonth();

  const sites: {
    slug: string;
    domain: string;
    articleCount: number;
    avgScore: number;
    clicksThisMonth: number;
    imageCount: number;
  }[] = [];

  let totalArticles = 0;
  let totalImages = 0;
  let totalClicks = 0;
  let scoreSum = 0;
  let scoreCount = 0;

  for (const siteSlug of slugs) {
    const site = await getSiteBySlug(siteSlug);
    if (!site || site.comingSoon) continue;

    const articles = await getPublishedArticles(siteSlug);
    const articleCount = articles.length;

    const scores = articles.map((a) => a.score).filter((s) => s > 0);
    const avgScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

    // Clicks for this site's articles this month
    let clicksThisMonth = 0;
    for (const [, slugClicks] of Object.entries(clickData)) {
      clicksThisMonth += slugClicks[currentMonth] || 0;
    }

    let imageCount = 0;
    if (redis) {
      try {
        imageCount = await redis.scard(`images:site:${siteSlug}`);
      } catch {
        // Redis unavailable
      }
    }

    sites.push({
      slug: siteSlug,
      domain: site.domain,
      articleCount,
      avgScore,
      clicksThisMonth,
      imageCount,
    });

    totalArticles += articleCount;
    totalImages += imageCount;
    scoreSum += scores.reduce((a, b) => a + b, 0);
    scoreCount += scores.length;
  }

  // Total clicks
  for (const slugClicks of Object.values(clickData)) {
    totalClicks += slugClicks[currentMonth] || 0;
  }

  const avgScore =
    scoreCount > 0 ? Math.round(scoreSum / scoreCount) : 0;

  return NextResponse.json({
    sites,
    totals: {
      articles: totalArticles,
      images: totalImages,
      clicksThisMonth: totalClicks,
      avgScore,
    },
  });
}
