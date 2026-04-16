// @ts-nocheck
import { notFound } from "next/navigation";
import Script from "next/script";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ConsentManager } from "@/components/ConsentManager";
import { getSiteBySlug, getThemeColors, getAllSiteSlugs } from "@/lib/get-sites";
import type { NavItem } from "@/lib/get-sites";
import { getPublishedArticles } from "@/lib/get-articles";
import { getAllCategories } from "@/lib/get-categories";
import { slugifyTag } from "@/lib/get-tags";
import { getGroupedToolsForSite } from "@/lib/tools";

type Props = {
  children: React.ReactNode;
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
    metadataBase: new URL(siteUrl),
    title: {
      default: site.name,
      template: `%s | ${site.name}`,
    },
    description: site.description,
    openGraph: {
      type: "website",
      locale: "de_DE",
      siteName: site.name,
      url: siteUrl,
      images: [{
        url: `/og/og-${siteSlug}.jpg`,
        width: 1200,
        height: 630,
        alt: `${site.name} – ${site.description}`,
      }],
    },
    twitter: {
      card: "summary_large_image",
      images: [`/og/og-${siteSlug}.jpg`],
    },
    alternates: {
      canonical: siteUrl,
    },
    // Google AdSense site verification (temporary – remove after approval)
    other: {
      "google-adsense-account": "ca-pub-7671391336657967",
    },
  };
}

export default async function SiteLayout({ children, params }: Props) {
  const { siteSlug } = await params;
  const site = await getSiteBySlug(siteSlug);

  if (!site) {
    notFound();
  }

  if (site.comingSoon) {
    const theme = getThemeColors(site.themePreset);
    const themeStyle = {
      "--theme-primary-50": theme.primary[50],
      "--theme-primary-100": theme.primary[100],
      "--theme-primary-600": theme.primary[600],
      "--theme-primary-700": theme.primary[700],
      "--theme-accent-50": theme.accent[50],
      "--theme-accent-100": theme.accent[100],
      "--theme-accent-600": theme.accent[600],
      "--theme-accent-700": theme.accent[700],
    } as React.CSSProperties;

    return (
      <div style={themeStyle} className="flex flex-col min-h-screen items-center justify-center bg-gray-50">
        <main className="text-center px-6 py-24">
          {site.logo && (
            <img src={site.logo} alt={site.logoAlt || site.name} className="h-12 mx-auto mb-8" />
          )}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{site.name}</h1>
          <p className="text-xl text-gray-600 max-w-md mx-auto">{site.description}</p>
          <div className="mt-8 inline-block px-6 py-3 rounded-full text-sm font-medium" style={{ backgroundColor: "var(--theme-primary-100)", color: "var(--theme-primary-700)" }}>
            Demnächst verfügbar
          </div>
        </main>
      </div>
    );
  }

  // Artikelbilder + automatische Mega-Menü-Children aus Artikeln
  const articles = await getPublishedArticles(siteSlug);
  const articleImages: Record<string, { src: string; alt: string }> = {};
  const articlesByCategory: Record<string, { title: string; slug: string }[]> = {};
  for (const article of articles) {
    if (article.image) {
      articleImages[article.slug] = {
        src: article.image,
        alt: article.imageAlt || article.title,
      };
    }
    if (article.category) {
      if (!articlesByCategory[article.category]) {
        articlesByCategory[article.category] = [];
      }
      articlesByCategory[article.category].push({
        title: article.title,
        slug: article.slug,
      });
    }
  }

  // Nav-Items aus typisierten RawNavItems auflösen
  const categories = await getAllCategories(siteSlug);
  const categoryMap = Object.fromEntries(categories.map((c) => [c.slug, c]));

  const enrichedNavItems: NavItem[] = site.navItems.map((raw) => {
    switch (raw.discriminant) {
      case "startseite":
        return {
          label: raw.value.label || "Startseite",
          href: "/",
          children: [],
        };

      case "kategorie": {
        const catSlug = raw.value.category;
        const cat = catSlug ? categoryMap[catSlug] : null;
        const label = raw.value.labelOverride || cat?.name || catSlug || "Kategorie";
        const catArticles = articlesByCategory[catSlug || ""] || [];
        return {
          label,
          href: `/kategorie/${catSlug}`,
          children: catArticles.map((a) => ({
            label: a.title,
            href: `/${a.slug}`,
          })),
        };
      }

      case "tag": {
        const tagName = raw.value.tag;
        return {
          label: raw.value.labelOverride || tagName,
          href: `/tag/${slugifyTag(tagName)}`,
          children: [],
        };
      }

      case "link": {
        // Mega-Menü für /tools: Tool-Gruppen als Children
        let linkChildren: { label: string; href: string }[] = [];
        if (raw.value.href === "/tools") {
          const groups = getGroupedToolsForSite(siteSlug);
          linkChildren = groups.flatMap((g) =>
            g.tools.map((t) => ({
              label: t.shortTitle,
              href: `/tools/${t.slug}`,
            }))
          );
        }
        return {
          label: raw.value.label,
          href: raw.value.href,
          children: linkChildren,
        };
      }
    }
  });

  const theme = getThemeColors(site.themePreset);

  const themeStyle = {
    "--theme-primary-50": theme.primary[50],
    "--theme-primary-100": theme.primary[100],
    "--theme-primary-600": theme.primary[600],
    "--theme-primary-700": theme.primary[700],
    "--theme-accent-50": theme.accent[50],
    "--theme-accent-100": theme.accent[100],
    "--theme-accent-600": theme.accent[600],
    "--theme-accent-700": theme.accent[700],
  } as React.CSSProperties;

  return (
    <div style={themeStyle} className="flex flex-col min-h-screen">
      <Header
        siteName={site.name}
        logo={site.logo}
        logoAlt={site.logoAlt}
        navItems={enrichedNavItems}
        articleImages={articleImages}
      />
      <main className="flex-1">{children}</main>
      <Footer siteName={site.name} enableAffiliates={site.enableAffiliates} />
      <ConsentManager
        siteName={site.name}
        adsenseClientId={site.adsenseClientId}
      />
      {site.umamiWebsiteId && (
        <Script
          src="/u/script.js"
          data-website-id={site.umamiWebsiteId}
          data-host-url="/u"
          data-domains={`${site.domain},${site.domain.replace(/^www\./, "")}`}
          strategy="afterInteractive"
        />
      )}
    </div>
  );
}
