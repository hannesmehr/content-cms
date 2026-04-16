import { getPayload } from "payload";
import config from "@payload-config";

export type AffiliateLink = {
  slug: string;
  name: string;
  targetUrl: string;
  description: string;
};

export async function getAllAffiliateLinks(): Promise<AffiliateLink[]> {
  try {
    const payload = await getPayload({ config });

    const result = await payload.find({
      collection: "affiliate-links",
      limit: 500,
    });

    return result.docs.map((doc) => ({
      slug: doc.slug as string,
      name: doc.name as string,
      targetUrl: doc.targetUrl as string,
      description: (doc.description as string) || "",
    }));
  } catch {
    return [];
  }
}

export async function getAffiliateLinkBySlug(
  slug: string
): Promise<AffiliateLink | null> {
  try {
    const payload = await getPayload({ config });

    const result = await payload.find({
      collection: "affiliate-links",
      where: { slug: { equals: slug } },
      limit: 1,
    });

    const doc = result.docs[0];
    if (!doc) return null;

    return {
      slug: doc.slug as string,
      name: doc.name as string,
      targetUrl: doc.targetUrl as string,
      description: (doc.description as string) || "",
    };
  } catch {
    return null;
  }
}
