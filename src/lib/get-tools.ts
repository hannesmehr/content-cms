// @ts-nocheck
import { getPayload } from "payload";
import config from "@payload-config";

export type ToolContent = {
  slug: string;
  seoTitle: string | null;
  seoDescription: string | null;
  contentAbove: any;
  contentBelow: any;
  faqItems: { question: string; answer: string }[];
};

export async function getToolContent(
  toolSlug: string,
  siteSlug: string
): Promise<ToolContent | null> {
  try {
    const payload = await getPayload({ config });

    const siteResult = await payload.find({
      collection: "sites",
      where: { slug: { equals: siteSlug } },
      limit: 1,
    });
    const siteId = siteResult.docs[0]?.id;
    if (!siteId) return null;

    const result = await payload.find({
      collection: "tools",
      where: {
        slug: { equals: toolSlug },
        site: { equals: siteId },
      },
      limit: 1,
    });

    const doc = result.docs[0];
    if (!doc) return null;

    return {
      slug: doc.slug as string,
      seoTitle: (doc.seoTitle as string) || null,
      seoDescription: (doc.seoDescription as string) || null,
      contentAbove: doc.contentAbove || null,
      contentBelow: doc.contentBelow || null,
      faqItems: Array.isArray(doc.faqItems)
        ? doc.faqItems.map(
            (item: { question?: string; answer?: string }) => ({
              question: item.question || "",
              answer: item.answer || "",
            })
          )
        : [],
    };
  } catch {
    return null;
  }
}
