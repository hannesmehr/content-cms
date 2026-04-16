import { getPayload } from "payload";
import config from "@payload-config";
import { getPublishedArticles } from "./get-articles";

export type AdSlotAssignment = {
  slot: string;
  adConfig: string | null;
};

export type Category = {
  slug: string;
  name: string;
  description: string;
  site: string;
  adSlots: AdSlotAssignment[];
};

export async function getAllCategories(siteSlug: string): Promise<Category[]> {
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
      collection: "categories",
      where: { site: { equals: siteId } },
      limit: 500,
    });

    return result.docs
      .map((doc) => ({
        slug: doc.slug as string,
        name: doc.name as string,
        description: (doc.description as string) || "",
        site: siteSlug,
        adSlots: Array.isArray(doc.adSlots)
          ? doc.adSlots.map(
              (a: { slot?: string; adConfig?: string | null }) => ({
                slot: a.slot || "",
                adConfig: a.adConfig || null,
              })
            )
          : [],
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "de"));
  } catch {
    return [];
  }
}

export async function getCategoryBySlug(
  slug: string,
  siteSlug: string
): Promise<Category | null> {
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
      collection: "categories",
      where: {
        slug: { equals: slug },
        site: { equals: siteId },
      },
      limit: 1,
    });

    const doc = result.docs[0];
    if (!doc) return null;

    return {
      slug: doc.slug as string,
      name: doc.name as string,
      description: (doc.description as string) || "",
      site: siteSlug,
      adSlots: Array.isArray(doc.adSlots)
        ? doc.adSlots.map(
            (a: { slot?: string; adConfig?: string | null }) => ({
              slot: a.slot || "",
              adConfig: a.adConfig || null,
            })
          )
        : [],
    };
  } catch {
    return null;
  }
}

export async function getArticlesByCategory(
  categorySlug: string,
  siteSlug: string
) {
  const articles = await getPublishedArticles(siteSlug);
  return articles.filter((a) => a.category === categorySlug);
}
