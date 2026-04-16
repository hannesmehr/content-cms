import { NextResponse } from "next/server";
import { getAllSites } from "@/lib/get-sites";
import { getPageviewsForRange, getStatsForRange, getEvents, getTopReferrersForRange } from "@/lib/umami";

export const dynamic = "force-dynamic";

// GET /api/admin/traffic?hours=24&site=wohnwagenratgeber-de
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hours = parseInt(searchParams.get("hours") || "720", 10);
  const siteFilter = searchParams.get("site");

  const allSites = await getAllSites();
  const sites = allSites.filter((s) => !s.comingSoon && s.umamiWebsiteId);

  const targetSites = siteFilter
    ? sites.filter((s) => s.slug === siteFilter)
    : sites;

  if (targetSites.length === 0) {
    return NextResponse.json({ chart: [], stats: null, perSite: [] });
  }

  // Fetch pageviews + stats + events + referrers in parallel
  const [pageviewResults, statsResults, eventResults, referrerResults] = await Promise.all([
    Promise.allSettled(targetSites.map((s) => getPageviewsForRange(s.umamiWebsiteId, hours))),
    Promise.allSettled(targetSites.map((s) => getStatsForRange(s.umamiWebsiteId, hours))),
    Promise.allSettled(targetSites.map((s) => getEvents(s.umamiWebsiteId, Math.ceil(hours / 24)))),
    Promise.allSettled(targetSites.map((s) => getTopReferrersForRange(s.umamiWebsiteId, hours, 10))),
  ]);

  // Per-site breakdown
  const perSite: {
    slug: string;
    domain: string;
    pageviews: number;
    visitors: number;
    bounceRate: number;
    affiliateClicks: number;
  }[] = [];

  let totalPageviews = 0;
  let totalVisitors = 0;
  let totalVisits = 0;
  let totalBounces = 0;
  let totalTime = 0;
  let prevPageviews = 0;
  let prevVisitors = 0;
  let prevVisits = 0;
  let prevBounces = 0;
  let prevTime = 0;
  let totalAffiliateClicks = 0;

  for (let i = 0; i < targetSites.length; i++) {
    const site = targetSites[i];
    const sr = statsResults[i];
    const er = eventResults[i];
    const stats = sr.status === "fulfilled" ? sr.value : null;
    const events = er.status === "fulfilled" ? er.value : null;

    const pv = stats?.pageviews?.value ?? 0;
    const vis = stats?.visitors?.value ?? 0;
    const vst = stats?.visits?.value ?? 0;
    const bnc = stats?.bounces?.value ?? 0;

    const boxClicks = events?.find((e) => e.x === "affiliate-box-click")?.y ?? 0;
    const linkClicks = events?.find((e) => e.x === "affiliate-link-click")?.y ?? 0;
    const affClicks = boxClicks + linkClicks;

    perSite.push({
      slug: site.slug,
      domain: site.domain,
      pageviews: pv,
      visitors: vis,
      bounceRate: vst > 0 ? Math.round((bnc / vst) * 100) : 0,
      affiliateClicks: affClicks,
    });

    totalPageviews += pv;
    totalVisitors += vis;
    totalVisits += vst;
    totalBounces += bnc;
    totalTime += stats?.totaltime?.value ?? 0;
    totalAffiliateClicks += affClicks;

    prevPageviews += stats?.pageviews?.prev ?? 0;
    prevVisitors += stats?.visitors?.prev ?? 0;
    prevVisits += stats?.visits?.prev ?? 0;
    prevBounces += stats?.bounces?.prev ?? 0;
    prevTime += stats?.totaltime?.prev ?? 0;
  }

  // Aggregate chart data
  const timeMap = new Map<string, { pageviews: number; visitors: number }>();
  for (let i = 0; i < pageviewResults.length; i++) {
    const pr = pageviewResults[i];
    const result = pr.status === "fulfilled" ? pr.value : null;
    if (!result) continue;
    for (let j = 0; j < result.pageviews.length; j++) {
      const key = result.pageviews[j].x;
      const existing = timeMap.get(key) || { pageviews: 0, visitors: 0 };
      existing.pageviews += result.pageviews[j].y;
      existing.visitors += (result.sessions[j]?.y ?? 0);
      timeMap.set(key, existing);
    }
  }

  const chart = Array.from(timeMap.entries())
    .map(([date, d]) => ({ date, ...d }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Aggregate referrers across all sites + per-site breakdown
  const referrerMap = new Map<string, number>();
  const referrersBySite: { site: string; domain: string; referrers: { name: string; count: number }[] }[] = [];

  for (let i = 0; i < targetSites.length; i++) {
    const rr = referrerResults[i];
    const refs = rr.status === "fulfilled" ? rr.value : null;
    if (!refs) continue;

    const siteRefs = refs
      .filter((r) => r.x)
      .map((r) => ({ name: r.x, count: r.y }));

    if (siteRefs.length > 0) {
      referrersBySite.push({
        site: targetSites[i].slug,
        domain: targetSites[i].domain,
        referrers: siteRefs,
      });
    }

    for (const ref of refs) {
      if (!ref.x) continue;
      referrerMap.set(ref.x, (referrerMap.get(ref.x) || 0) + ref.y);
    }
  }

  const topReferrers = Array.from(referrerMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  return NextResponse.json({
    chart,
    stats: {
      pageviews: { value: totalPageviews, prev: prevPageviews },
      visitors: { value: totalVisitors, prev: prevVisitors },
      bounceRate: totalVisits > 0 ? Math.round((totalBounces / totalVisits) * 100) : 0,
      prevBounceRate: prevVisits > 0 ? Math.round((prevBounces / prevVisits) * 100) : 0,
      avgDuration: totalVisits > 0 ? totalTime / totalVisits / 1000 : 0,
      prevAvgDuration: prevVisits > 0 ? prevTime / prevVisits / 1000 : 0,
      affiliateClicks: totalAffiliateClicks,
    },
    perSite: perSite.sort((a, b) => b.pageviews - a.pageviews),
    topReferrers,
    referrersBySite,
  });
}
