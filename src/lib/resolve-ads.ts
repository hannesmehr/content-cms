import type { AdConfig, AdSlotAssignment } from "./get-ad-config";
import { getAdConfigBySlug } from "./get-ad-config";
import { AD_SLOTS, type AdSlotName } from "./ad-slots";

type AdContext = {
  hideAds?: boolean;
  enableAds?: boolean;
  articleSlots?: AdSlotAssignment[];
  categorySlots?: AdSlotAssignment[];
  siteSlots?: AdSlotAssignment[];
};

function resolveAdSlot(
  slotName: string,
  context: AdContext
): string | null {
  if (context.hideAds) return null;

  const articleMatch = context.articleSlots?.find((a) => a.slot === slotName);
  if (articleMatch) return articleMatch.adConfig;

  const categoryMatch = context.categorySlots?.find(
    (a) => a.slot === slotName
  );
  if (categoryMatch) return categoryMatch.adConfig;

  const siteMatch = context.siteSlots?.find((a) => a.slot === slotName);
  if (siteMatch) return siteMatch.adConfig;

  return null;
}

export async function resolveAdsForPage(
  context: AdContext
): Promise<Record<string, AdConfig | null>> {
  // If ads are globally disabled for this site, return all nulls
  if (context.enableAds === false) {
    return Object.fromEntries(
      (Object.keys(AD_SLOTS) as AdSlotName[]).map((s) => [s, null])
    );
  }

  const result: Record<string, AdConfig | null> = {};

  for (const slotName of Object.keys(AD_SLOTS) as AdSlotName[]) {
    const configSlug = resolveAdSlot(slotName, context);
    if (configSlug) {
      result[slotName] = await getAdConfigBySlug(configSlug);
    } else {
      result[slotName] = null;
    }
  }

  return result;
}
