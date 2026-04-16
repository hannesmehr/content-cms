import { NextResponse } from "next/server";
import { getPublishedArticles } from "@/lib/get-articles";
import { getAllCategories } from "@/lib/get-categories";
// Tags sind noindex → nicht in der Sitemap (vermeidet Thin-Content-Indexierung)
import { getSiteBySlug } from "@/lib/get-sites";
import { getToolsForSite } from "@/lib/tools";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ siteSlug: string }> }
) {
  const { siteSlug } = await params;
  const site = await getSiteBySlug(siteSlug);
  if (!site) return new NextResponse("Not found", { status: 404 });

  const siteUrl = `https://${site.domain}`;

  const [articles, categories] = await Promise.all([
    getPublishedArticles(siteSlug),
    getAllCategories(siteSlug),
  ]);

  const tools = getToolsForSite(siteSlug);

  const urls = [
    { loc: siteUrl, changefreq: "daily", priority: "1.0" },
    ...categories.map((cat) => ({
      loc: `${siteUrl}/kategorie/${cat.slug}`,
      changefreq: "weekly",
      priority: "0.6",
    })),
    ...articles.map((article) => ({
      loc: `${siteUrl}/${article.slug}`,
      changefreq: "monthly",
      priority: "0.8",
      lastmod: article.date,
    })),
    ...(tools.length > 0
      ? [
          {
            loc: `${siteUrl}/tools`,
            changefreq: "weekly",
            priority: "0.7",
          },
          ...tools.map((tool) => ({
            loc: `${siteUrl}/tools/${tool.slug}`,
            changefreq: "monthly",
            priority: "0.7",
          })),
        ]
      : []),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${"lastmod" in u ? `\n    <lastmod>${u.lastmod}</lastmod>` : ""}
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
