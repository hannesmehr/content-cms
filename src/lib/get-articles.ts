// Payload-based article retrieval (replaces Keystatic reader)

import { getPayload } from "payload";
import config from "@payload-config";

export type Article = {
  slug: string;
  title: string;
  description: string;
  date: string;
  lastFactCheck?: string;
  draft: boolean;
  featured: boolean;
  sponsored: boolean;
  hideAds: boolean;
  score: number;
  reviewStatus?: string;
  category?: string;
  tags: string[];
  image?: string;
  imageAlt?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content?: any;
  adSlots?: { slot: string; adConfig: string }[];
};

export async function getPublishedArticles(
  siteSlug: string
): Promise<Article[]> {
  try {
    const payload = await getPayload({ config });

    // First find the site ID
    const siteResult = await payload.find({
      collection: "sites",
      where: { slug: { equals: siteSlug } },
      limit: 1,
      select: { id: true },
    });
    const siteId = siteResult.docs[0]?.id;
    if (!siteId) return [];

    const result = await payload.find({
      collection: "posts",
      where: {
        site: { equals: siteId },
        draft: { equals: false },
      },
      sort: "-score,-date",
      limit: 1000,
    });

    return result.docs.map((doc) => ({
      slug: doc.slug as string,
      title: doc.title as string,
      description: doc.description as string,
      date: doc.date as string,
      lastFactCheck: doc.lastFactCheck as string | undefined,
      draft: doc.draft as boolean,
      featured: doc.featured as boolean,
      sponsored: doc.sponsored as boolean,
      hideAds: doc.hideAds as boolean,
      score: (doc.score as number) || 0,
      reviewStatus: doc.reviewStatus as string | undefined,
      category:
        typeof doc.category === "object" && doc.category !== null
          ? (doc.category as { slug?: string }).slug
          : undefined,
      tags: Array.isArray(doc.tags)
        ? doc.tags.map((t: { tag?: string }) => t.tag || "").filter(Boolean)
        : [],
      image:
        typeof doc.image === "object" && doc.image !== null
          ? (doc.image as { url?: string }).url
          : (doc.imageUrl as string) || undefined,
      imageAlt: doc.imageAlt as string | undefined,
    }));
  } catch (err) {
    console.error("[getPublishedArticles] Error for site", siteSlug, err);
    return [];
  }
}

export type FullArticle = Article & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
};

export async function getArticleBySlug(
  slug: string,
  siteSlug: string
): Promise<FullArticle | null> {
  try {
    const payload = await getPayload({ config });

    const siteResult = await payload.find({
      collection: "sites",
      where: { slug: { equals: siteSlug } },
      limit: 1,
      select: { id: true },
    });
    const siteId = siteResult.docs[0]?.id;
    if (!siteId) return null;

    const result = await payload.find({
      collection: "posts",
      where: {
        slug: { equals: slug },
        site: { equals: siteId },
      },
      limit: 1,
      depth: 2,
    });

    const doc = result.docs[0];
    if (!doc) return null;

    return {
      slug: doc.slug as string,
      title: doc.title as string,
      description: doc.description as string,
      date: doc.date as string,
      lastFactCheck: doc.lastFactCheck as string | undefined,
      draft: doc.draft as boolean,
      featured: doc.featured as boolean,
      sponsored: doc.sponsored as boolean,
      hideAds: doc.hideAds as boolean,
      score: (doc.score as number) || 0,
      reviewStatus: doc.reviewStatus as string | undefined,
      category:
        typeof doc.category === "object" && doc.category !== null
          ? (doc.category as { slug?: string }).slug
          : undefined,
      tags: Array.isArray(doc.tags)
        ? doc.tags.map((t: { tag?: string }) => t.tag || "").filter(Boolean)
        : [],
      image:
        typeof doc.image === "object" && doc.image !== null
          ? (doc.image as { url?: string }).url
          : (doc.imageUrl as string) || undefined,
      imageAlt: doc.imageAlt as string | undefined,
      content: doc.content,
      adSlots: Array.isArray(doc.adSlots)
        ? doc.adSlots.map((s: { slot?: string; adConfig?: unknown }) => ({
            slot: (s.slot as string) || "",
            adConfig:
              typeof s.adConfig === "object" && s.adConfig !== null
                ? ((s.adConfig as { slug?: string }).slug as string) || ""
                : (s.adConfig as string) || "",
          }))
        : [],
    };
  } catch {
    return null;
  }
}

export async function getAllArticleSlugs(
  siteSlug: string
): Promise<string[]> {
  try {
    const payload = await getPayload({ config });

    const siteResult = await payload.find({
      collection: "sites",
      where: { slug: { equals: siteSlug } },
      limit: 1,
      select: { id: true },
    });
    const siteId = siteResult.docs[0]?.id;
    if (!siteId) return [];

    const result = await payload.find({
      collection: "posts",
      where: {
        site: { equals: siteId },
        draft: { equals: false },
      },
      select: { slug: true },
      limit: 2000,
    });

    return result.docs.map((d) => d.slug as string).filter(Boolean);
  } catch {
    return [];
  }
}
