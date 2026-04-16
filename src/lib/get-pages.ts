import { getPayload } from "payload";
import config from "@payload-config";

export type Page = {
  slug: string;
  title: string;
  site: string;
  content: any;
};

export async function getPageBySlug(
  slug: string,
  siteSlug: string
): Promise<Page | null> {
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
      collection: "pages",
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
      title: doc.title as string,
      site: siteSlug,
      content: doc.content,
    };
  } catch {
    return null;
  }
}

export async function getAllPageSlugs(siteSlug: string): Promise<string[]> {
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
      collection: "pages",
      where: { site: { equals: siteId } },
      limit: 500,
      select: { slug: true },
    });

    return result.docs.map((doc) => doc.slug as string).filter(Boolean);
  } catch {
    return [];
  }
}
