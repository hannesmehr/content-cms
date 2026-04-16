// @ts-nocheck
import type { Metadata } from "next";
import { getPublishedArticles, type Article } from "@/lib/get-articles";
import { getAllCategories } from "@/lib/get-categories";
import { getSiteBySlug, getAllSiteSlugs } from "@/lib/get-sites";
import type { HomepageWidget } from "@/lib/get-sites";
import { FeaturedArticleCard } from "@/components/FeaturedArticleCard";
import { ArticleSlider } from "@/components/ArticleSlider";
import { CompactArticleCard } from "@/components/CompactArticleCard";
import { CategoryArticleSection } from "@/components/CategoryArticleSection";
import { TagCloud } from "@/components/TagCloud";
import { Sidebar } from "@/components/Sidebar";
import { HeroSection } from "@/components/HeroSection";
import { AdSlot } from "@/components/AdSlot";
import { ToolsShowcase } from "@/components/ToolsShowcase";
import { getAdConfigBySlug } from "@/lib/get-ad-config";
import { getToolsForSite } from "@/lib/tools";
import { WebsiteSchema } from "@/components/WebsiteSchema";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ siteSlug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getAllSiteSlugs();
  return slugs.map((siteSlug) => ({ siteSlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { siteSlug } = await params;
  const site = await getSiteBySlug(siteSlug);
  if (!site) return {};

  const siteUrl = `https://${site.domain}`;

  return {
    title: {
      absolute: `${site.name} – ${site.description}`,
    },
    description: site.description,
    alternates: {
      canonical: siteUrl,
    },
    openGraph: {
      title: site.name,
      description: site.description,
      type: "website",
      url: siteUrl,
      siteName: site.name,
      locale: "de_DE",
    },
    twitter: {
      card: "summary",
      title: site.name,
      description: site.description,
    },
  };
}

export default async function HomePage({ params }: Props) {
  const { siteSlug } = await params;
  const site = await getSiteBySlug(siteSlug);
  if (!site) notFound();

  const [articles, categories] = await Promise.all([
    getPublishedArticles(siteSlug),
    getAllCategories(siteSlug),
  ]);

  const widgets = site.widgets;

  const categoryMap = Object.fromEntries(
    categories.map((c) => [c.slug, c.name])
  );

  const articleCountByCategory: Record<string, number> = {};
  for (const article of articles) {
    if (article.category) {
      articleCountByCategory[article.category] =
        (articleCountByCategory[article.category] || 0) + 1;
    }
  }

  const featuredArticle =
    articles.find((a) => a.featured) || articles[0] || null;
  const nonFeatured = articles.filter((a) => a !== featuredArticle);

  // ── Widget Deduplication ──────────────────────────────────────────
  // Pre-compute article sets for each widget in config order.
  // Each widget "claims" its articles so subsequent widgets won't
  // show duplicates. Data is stored in a Map keyed by widget index.
  const usedSlugs = new Set<string>();
  if (featuredArticle) usedSlugs.add(featuredArticle.slug);

  const widgetArticles = new Map<number, Article[]>();
  const widgetCategoryArticles = new Map<number, typeof articlesByCategory>();

  // Temporary: compute articlesByCategory once (unfiltered, for reference)
  const articlesByCategory = categories
    .map((c) => ({
      ...c,
      articles: articles.filter((a) => a.category === c.slug),
    }))
    .filter((c) => c.articles.length > 0);

  for (let i = 0; i < widgets.length; i++) {
    const w = widgets[i];
    if (w.type === "slider" || w.type === "list") {
      const result = nonFeatured
        .filter((a) => !usedSlugs.has(a.slug))
        .slice(0, w.count);
      for (const a of result) usedSlugs.add(a.slug);
      widgetArticles.set(i, result);
    } else if (w.type === "tags") {
      // Tags is an interactive filter – pass all non-used articles
      // but do NOT mark them as used (other widgets may still show them)
      const tagArticles = articles.filter((a) => !usedSlugs.has(a.slug));
      widgetArticles.set(i, tagArticles);
    } else if (w.type === "categories") {
      const cats = articlesByCategory
        .map((c) => ({
          ...c,
          articles: c.articles
            .filter((a) => !usedSlugs.has(a.slug))
            .slice(0, 4),
        }))
        .filter((c) => c.articles.length > 0)
        .slice(0, w.count);
      for (const c of cats) for (const a of c.articles) usedSlugs.add(a.slug);
      widgetCategoryArticles.set(i, cats);
    }
  }

  const tagCounts: Record<string, number> = {};
  for (const a of articles) {
    for (const t of a.tags) {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    }
  }

  // Pre-resolve ad configs for ad widgets
  const adWidgetConfigs = new Map<HomepageWidget, Awaited<ReturnType<typeof getAdConfigBySlug>>>();
  for (const w of widgets) {
    if (w.type === "ad" && w.adConfig) {
      adWidgetConfigs.set(w, await getAdConfigBySlug(w.adConfig));
    }
  }

  const siteTools = getToolsForSite(siteSlug);

  const hasHero = widgets.some((w) => w.type === "hero");

  function renderWidget(widget: HomepageWidget, index: number) {
    switch (widget.type) {
      case "hero":
        return (
          <HeroSection
            key={`widget-${index}`}
            title={widget.title || site!.name}
            subline={widget.heroSubline || site!.description}
            style={widget.heroStyle}
            image={widget.heroImage}
            imageAlt={widget.heroImageAlt}
            ctaText={widget.heroCtaText}
            ctaLink={widget.heroCtaLink}
          />
        );

      case "featured":
        if (!featuredArticle) return null;
        return (
          <FeaturedArticleCard
            key={`widget-${index}`}
            className="mt-8"
            article={featuredArticle}
            categoryName={
              featuredArticle.category
                ? categoryMap[featuredArticle.category] || null
                : null
            }
          />
        );

      case "slider": {
        const sliderArticles = widgetArticles.get(index) ?? [];
        if (sliderArticles.length === 0) return null;
        return (
          <section key={`widget-${index}`}>
            {widget.title && (
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {widget.title}
              </h2>
            )}
            <ArticleSlider
              articles={sliderArticles}
              categoryMap={categoryMap}
            />
          </section>
        );
      }

      case "list": {
        const listArticles = widgetArticles.get(index) ?? [];
        if (listArticles.length === 0) return null;
        return (
          <section key={`widget-${index}`} className="mt-10 mb-12">
            {widget.title && (
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {widget.title}
              </h2>
            )}
            <div className="grid sm:grid-cols-2 gap-x-8">
              {listArticles.map((article) => (
                <div key={article.slug} className="border-b border-gray-100">
                  <CompactArticleCard
                    article={article}
                    showDescription={widget.showDescription}
                    descriptionLines={widget.descriptionLines}
                    categoryName={
                      article.category
                        ? categoryMap[article.category] || null
                        : null
                    }
                  />
                </div>
              ))}
            </div>
          </section>
        );
      }

      case "categories": {
        const cats = widgetCategoryArticles.get(index) ?? [];
        if (cats.length === 0) return null;
        return (
          <section key={`widget-${index}`} className="mt-16">
            {widget.title && (
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {widget.title}
              </h2>
            )}
            <div className="grid gap-8 sm:grid-cols-2">
              {cats.map((cat) => (
                <CategoryArticleSection
                  key={cat.slug}
                  categoryName={cat.name}
                  categorySlug={cat.slug}
                  articles={cat.articles}
                  showDescription={widget.showDescription}
                  descriptionLines={widget.descriptionLines}
                />
              ))}
            </div>
          </section>
        );
      }

      case "tags": {
        const topTags = Object.entries(tagCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, widget.count)
          .map(([tag]) => tag);
        if (topTags.length === 0) return null;
        return (
          <section key={`widget-${index}`} className="mt-16 mb-12">
            {widget.title && (
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {widget.title}
              </h2>
            )}
            <TagCloud tags={topTags} articles={widgetArticles.get(index) ?? []} showDescription={widget.showDescription} descriptionLines={widget.descriptionLines} />
          </section>
        );
      }

      case "tools": {
        if (siteTools.length === 0) return null;
        return (
          <ToolsShowcase
            key={`widget-${index}`}
            tools={siteTools}
            title={widget.title}
            count={widget.count}
          />
        );
      }

      case "ad": {
        if (!site!.enableAds) return null;
        const adConfig = adWidgetConfigs.get(widget) ?? null;
        if (!adConfig) return null;
        return <AdSlot key={`widget-${index}`} config={adConfig} />;
      }

      default:
        return null;
    }
  }

  // When sidebar is off, render all widgets in configured order.
  // When sidebar is on, split into before/companion/after zones for the sidebar layout.
  const renderAllInOrder = !site.showSidebar;

  const sidebarAfterIndex = site.showSidebar
    ? widgets.findIndex((w) => w.type === "slider" || w.type === "list")
    : -1;
  const widgetsBefore =
    sidebarAfterIndex >= 0 ? widgets.slice(0, sidebarAfterIndex) : [];
  const widgetsWithSidebar =
    sidebarAfterIndex >= 0 ? widgets.slice(sidebarAfterIndex) : [];
  const sidebarCompanions = widgetsWithSidebar.filter(
    (w) => w.type === "slider" || w.type === "list"
  );
  const widgetsAfter = widgetsWithSidebar.filter(
    (w) => w.type !== "slider" && w.type !== "list"
  );

  const siteUrl = `https://${site.domain}`;

  return (
    <>
      <WebsiteSchema
        siteName={site.name}
        siteUrl={siteUrl}
        description={site.description}
      />
    <div className="mx-auto max-w-6xl px-4 py-12">
      {!hasHero && (
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900">{site.name}</h1>
          <p className="mt-2 text-lg text-gray-600">{site.description}</p>
        </div>
      )}

      {articles.length === 0 ? (
        <p className="text-gray-500">Noch keine Artikel vorhanden.</p>
      ) : renderAllInOrder ? (
        <>
          {widgets.map((w, i) => renderWidget(w, i))}
        </>
      ) : (
        <>
          {widgetsBefore.map((w, i) => renderWidget(w, i))}

          {sidebarCompanions.length > 0 ? (
            <div className="flex flex-col lg:flex-row gap-10">
              <div className="flex-1 min-w-0">
                {sidebarCompanions.map((w, i) =>
                  renderWidget(w, widgetsBefore.length + i)
                )}
              </div>
              <div className="hidden lg:block w-full lg:w-72 shrink-0">
                <Sidebar
                  recentArticles={articles}
                  categories={categories}
                  articleCountByCategory={articleCountByCategory}
                />
              </div>
            </div>
          ) : (
            <div className="hidden lg:block">
              <Sidebar
                recentArticles={articles}
                categories={categories}
                articleCountByCategory={articleCountByCategory}
              />
            </div>
          )}

          {widgetsAfter.map((w, i) =>
            renderWidget(
              w,
              widgetsBefore.length + sidebarCompanions.length + i
            )
          )}
        </>
      )}
    </div>
    </>
  );
}
