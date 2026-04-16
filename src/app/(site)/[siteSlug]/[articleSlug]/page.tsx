// @ts-nocheck
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticleBySlug, getPublishedArticles } from "@/lib/get-articles";
import { getCategoryBySlug } from "@/lib/get-categories";
import { getSiteBySlug, getAllSiteSlugs } from "@/lib/get-sites";
import { ArticlePage } from "@/components/ArticlePage";
import { ArticleSchema } from "@/components/ArticleSchema";
import { resolveAdsForPage } from "@/lib/resolve-ads";

export const revalidate = 3600; // ISR: 1h cache, on-demand regeneration

type Props = {
  params: Promise<{ siteSlug: string; articleSlug: string }>;
};

export async function generateStaticParams() {
  const siteSlugs = await getAllSiteSlugs();
  const params: { siteSlug: string; articleSlug: string }[] = [];

  for (const siteSlug of siteSlugs) {
    const articles = await getPublishedArticles(siteSlug);
    const featured = articles.filter((a) => a.featured).slice(0, 10);
    for (const article of featured) {
      params.push({ siteSlug, articleSlug: article.slug });
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { siteSlug, articleSlug } = await params;
  const [article, site] = await Promise.all([
    getArticleBySlug(articleSlug, siteSlug),
    getSiteBySlug(siteSlug),
  ]);
  if (!article || !site) return {};

  const articleUrl = `https://${site.domain}/${articleSlug}`;

  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.date,
      url: articleUrl,
      siteName: site.name,
      locale: "de_DE",
      ...(article.image && {
        images: [{ url: article.image, alt: article.imageAlt || article.title }],
      }),
    },
    twitter: {
      card: article.image ? "summary_large_image" : "summary",
      title: article.title,
      description: article.description,
      ...(article.image && {
        images: [article.image],
      }),
    },
  };
}

export default async function ArticlePageRoute({ params }: Props) {
  const { siteSlug, articleSlug } = await params;
  const article = await getArticleBySlug(articleSlug, siteSlug);

  if (!article || article.draft) {
    notFound();
  }

  const [category, site] = await Promise.all([
    article.category ? getCategoryBySlug(article.category, siteSlug) : null,
    getSiteBySlug(siteSlug),
  ]);

  const siteUrl = site ? `https://${site.domain}` : "";

  const ads = await resolveAdsForPage({
    hideAds: article.hideAds,
    enableAds: site?.enableAds,
    articleSlots: article.adSlots,
    categorySlots: category?.adSlots,
    siteSlots: site?.adSlots,
  });

  const breadcrumbs = [
    { label: "Startseite", href: "/" },
    ...(category
      ? [{ label: category.name, href: `/kategorie/${category.slug}` }]
      : []),
    { label: article.title },
  ];

  return (
    <>
      <ArticleSchema
        title={article.title}
        description={article.description}
        date={article.date}
        url={`${siteUrl}/${article.slug}`}
        image={article.image}
        imageAlt={article.imageAlt}
        siteName={site?.name || ""}
        siteUrl={siteUrl}
        categoryName={category?.name}
        tags={article.tags}
      />
      <ArticlePage
        title={article.title}
        description={article.description}
        content={article.content}
        category={category}
        tags={article.tags}
        sponsored={article.sponsored}
        breadcrumbs={breadcrumbs}
        siteUrl={siteUrl}
        ads={ads}
        enableAds={site?.enableAds}
        enableAffiliates={site?.enableAffiliates}
      />
    </>
  );
}
