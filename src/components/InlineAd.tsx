import { getAdConfigBySlug } from "@/lib/get-ad-config";
import { AdSlot } from "./AdSlot";

type InlineAdProps = {
  adConfig: string;
};

export async function InlineAd({ adConfig }: InlineAdProps) {
  if (!adConfig) return null;

  const config = await getAdConfigBySlug(adConfig);
  return <AdSlot config={config} />;
}
