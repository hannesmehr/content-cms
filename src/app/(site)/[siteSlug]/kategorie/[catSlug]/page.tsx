// @ts-nocheck
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAllCategories,
  getCategoryBySlug,
  getArticlesByCategory,
} from "@/lib/get-categories";
import { getAllSiteSlugs, getSiteBySlug } from "@/lib/get-sites";
import { ArticleCard } from "@/components/ArticleCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AdSlot } from "@/components/AdSlot";
import { resolveAdsForPage } from "@/lib/resolve-ads";

export const revalidate = 3600;

type Props = {
  params: Promise<{ siteSlug: string; catSlug: string }>;
};

export async function generateStaticParams() {
  const siteSlugs = await getAllSiteSlugs();
  const params: { siteSlug: string; catSlug: string }[] = [];

  for (const siteSlug of siteSlugs) {
    const categories = await getAllCategories(siteSlug);
    for (const cat of categories) {
      params.push({ siteSlug, catSlug: cat.slug });
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { siteSlug, catSlug } = await params;
  const [category, site] = await Promise.all([
    getCategoryBySlug(catSlug, siteSlug),
    getSiteBySlug(siteSlug),
  ]);
  if (!category || !site) return {};

  const description = category.description || `Alle Artikel in ${category.name}`;
  const url = `https://${site.domain}/kategorie/${catSlug}`;

  return {
    title: category.name,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: category.name,
      description,
      type: "website",
      url,
      siteName: site.name,
      locale: "de_DE",
    },
    twitter: {
      card: "summary",
      title: category.name,
      description,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { siteSlug, catSlug } = await params;
  const [category, site] = await Promise.all([
    getCategoryBySlug(catSlug, siteSlug),
    getSiteBySlug(siteSlug),
  ]);
  if (!category || !site) notFound();
  if (!category) notFound();

  const articles = await getArticlesByCategory(catSlug, siteSlug);
  const siteUrl = `https://${site.domain}`;

  const ads = await resolveAdsForPage({
    enableAds: site.enableAds,
    categorySlots: category.adSlots,
    siteSlots: site.adSlots,
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Breadcrumbs
        items={[
          { label: "Startseite", href: "/" },
          { label: category.name },
        ]}
        siteUrl={siteUrl}
      />
      <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
      {category.description && (
        <p className="mt-2 text-lg text-gray-600">{category.description}</p>
      )}

      <AdSlot config={ads["category-top"]} />

      {articles.length === 0 ? (
        <p className="mt-8 text-gray-500">
          Noch keine Artikel in dieser Kategorie.
        </p>
      ) : (
        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          {articles.map((article) => (
            <ArticleCard
              key={article.slug}
              article={article}
              categoryName={category.name}
            />
          ))}
        </div>
      )}

      <AdSlot config={ads["category-bottom"]} />
    </div>
  );
}
