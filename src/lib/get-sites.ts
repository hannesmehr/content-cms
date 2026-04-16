// Payload-based site retrieval (replaces Keystatic reader)
// TODO: Replace with actual Payload Local API calls once DB is connected.
// For now, provides stub functions that match the old API signatures.

import { getPayload } from "payload";
import config from "@payload-config";

export type SiteConfig = {
  slug: string;
  name: string;
  domain: string;
  description: string;
  themePreset: string;
  enableAds: boolean;
  enableAffiliates: boolean;
  umamiWebsiteId: string;
  adsenseClientId: string;
  comingSoon: boolean;
  showSidebar: boolean;
};

export async function getAllSiteSlugs(): Promise<string[]> {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "sites",
      limit: 100,
      select: { slug: true },
    });
    return result.docs.map((doc) => doc.slug as string).filter(Boolean);
  } catch {
    // Fallback for build-time when DB isn't available
    return [];
  }
}

export async function getSiteBySlug(
  siteSlug: string
): Promise<SiteConfig | null> {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "sites",
      where: { slug: { equals: siteSlug } },
      limit: 1,
    });
    const doc = result.docs[0];
    if (!doc) return null;
    return {
      slug: doc.slug as string,
      name: doc.name as string,
      domain: doc.domain as string,
      description: (doc.description as string) || "",
      themePreset: (doc.themePreset as string) || "blue",
      enableAds: (doc.enableAds as boolean) ?? false,
      enableAffiliates: (doc.enableAffiliates as boolean) ?? false,
      umamiWebsiteId: (doc.umamiWebsiteId as string) || "",
      adsenseClientId: (doc.adsenseClientId as string) || "",
      comingSoon: (doc.comingSoon as boolean) ?? false,
      showSidebar: (doc.showSidebar as boolean) ?? true,
    };
  } catch {
    return null;
  }
}

export async function getAllSites(): Promise<SiteConfig[]> {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "sites",
      limit: 100,
    });
    return result.docs.map((doc) => ({
      slug: doc.slug as string,
      name: doc.name as string,
      domain: doc.domain as string,
      description: (doc.description as string) || "",
      themePreset: (doc.themePreset as string) || "blue",
      enableAds: (doc.enableAds as boolean) ?? false,
      enableAffiliates: (doc.enableAffiliates as boolean) ?? false,
      umamiWebsiteId: (doc.umamiWebsiteId as string) || "",
      adsenseClientId: (doc.adsenseClientId as string) || "",
      comingSoon: (doc.comingSoon as boolean) ?? false,
      showSidebar: (doc.showSidebar as boolean) ?? true,
    }));
  } catch {
    return [];
  }
}
