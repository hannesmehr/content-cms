// @ts-nocheck
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllTags, getArticlesByTag, slugifyTag } from "@/lib/get-tags";
import { getAllSiteSlugs, getSiteBySlug } from "@/lib/get-sites";
import { ArticleCard } from "@/components/ArticleCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AdSlot } from "@/components/AdSlot";
import { resolveAdsForPage } from "@/lib/resolve-ads";

export const revalidate = 3600;

type Props = {
  params: Promise<{ siteSlug: string; tagSlug: string }>;
};

export async function generateStaticParams() {
  // Tags are fully dynamic (on-demand ISR) — too many combinations to pre-render
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { siteSlug, tagSlug } = await params;
  const [tags, site] = await Promise.all([
    getAllTags(siteSlug),
    getSiteBySlug(siteSlug),
  ]);
  const tag = tags.find((t) => slugifyTag(t) === tagSlug);
  if (!tag || !site) return {};

  const title = `Thema: ${tag}`;
  const description = `Alle Artikel zum Thema "${tag}"`;
  const url = `https://${site.domain}/tag/${tagSlug}`;

  return {
    title,
    description,
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url,
      siteName: site.name,
      locale: "de_DE",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function TagPage({ params }: Props) {
  const { siteSlug, tagSlug } = await params;
  const [tags, site] = await Promise.all([
    getAllTags(siteSlug),
    getSiteBySlug(siteSlug),
  ]);
  const tag = tags.find((t) => slugifyTag(t) === tagSlug);
  if (!tag || !site) notFound();

  const articles = await getArticlesByTag(tag, siteSlug);
  const siteUrl = `https://${site.domain}`;

  const ads = await resolveAdsForPage({
    enableAds: site.enableAds,
    siteSlots: site.adSlots,
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Breadcrumbs
        items={[
          { label: "Startseite", href: "/" },
          { label: tag },
        ]}
        siteUrl={siteUrl}
      />
      <h1 className="text-3xl font-bold text-gray-900">Thema: {tag}</h1>

      <AdSlot config={ads["tag-top"]} />

      {articles.length === 0 ? (
        <p className="mt-8 text-gray-500">
          Keine Artikel mit diesem Tag gefunden.
        </p>
      ) : (
        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
