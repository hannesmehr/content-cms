import { getPayload } from "payload";
import config from "@payload-config";

export type AdConfig = {
  slug: string;
  name: string;
  enabled: boolean;
  type: "placeholder" | "adsense" | "banner" | "custom";
  adsenseSlotId: string;
  adsenseFormat: "auto" | "horizontal" | "rectangle" | "vertical";
  bannerImage: string;
  bannerImageAlt: string;
  bannerUrl: string;
  bannerAffiliate: string | null;
  customHtml: string;
};

export type AdSlotAssignment = {
  slot: string;
  adConfig: string | null;
};

export async function getAdConfigBySlug(
  slug: string
): Promise<AdConfig | null> {
  try {
    const payload = await getPayload({ config });

    const result = await payload.find({
      collection: "ad-configs",
      where: { slug: { equals: slug } },
      limit: 1,
    });

    const doc = result.docs[0];
    if (!doc) return null;

    return {
      slug: doc.slug as string,
      name: doc.name as string,
      enabled: (doc.enabled as boolean) ?? true,
      type: (doc.type as AdConfig["type"]) || "placeholder",
      adsenseSlotId: (doc.adsenseSlotId as string) || "",
      adsenseFormat:
        (doc.adsenseFormat as AdConfig["adsenseFormat"]) || "auto",
      bannerImage:
        typeof doc.bannerImage === "object" && doc.bannerImage !== null
          ? ((doc.bannerImage as { url?: string }).url || "")
          : String(doc.bannerImage || ""),
      bannerImageAlt: (doc.bannerImageAlt as string) || "",
      bannerUrl: (doc.bannerUrl as string) || "",
      bannerAffiliate: (doc.bannerAffiliate as string) || null,
      customHtml: (doc.customHtml as string) || "",
    };
  } catch {
    return null;
  }
}

export async function getAllAdConfigs(): Promise<AdConfig[]> {
  try {
    const payload = await getPayload({ config });

    const result = await payload.find({
      collection: "ad-configs",
      limit: 500,
    });

    const configs: AdConfig[] = [];
    for (const doc of result.docs) {
      configs.push({
        slug: doc.slug as string,
        name: doc.name as string,
        enabled: (doc.enabled as boolean) ?? true,
        type: (doc.type as AdConfig["type"]) || "placeholder",
        adsenseSlotId: (doc.adsenseSlotId as string) || "",
        adsenseFormat:
          (doc.adsenseFormat as AdConfig["adsenseFormat"]) || "auto",
        bannerImage:
          typeof doc.bannerImage === "object" && doc.bannerImage !== null
            ? ((doc.bannerImage as { url?: string }).url || "")
            : (doc.bannerImage as string) || "",
        bannerImageAlt: (doc.bannerImageAlt as string) || "",
        bannerUrl: (doc.bannerUrl as string) || "",
        bannerAffiliate: (doc.bannerAffiliate as string) || null,
        customHtml: (doc.customHtml as string) || "",
      });
    }

    return configs;
  } catch {
    return [];
  }
}
