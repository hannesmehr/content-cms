import type { AdConfig } from "@/lib/get-ad-config";
import { AdSensePlaceholder } from "./AdSensePlaceholder";

type AdSlotProps = {
  config: AdConfig | null;
  className?: string;
};

export function AdSlot({ config, className = "" }: AdSlotProps) {
  if (!config || config.enabled === false) return null;

  if (config.type === "placeholder") {
    return (
      <div
        className={`bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm py-8 my-8 ${className}`}
      >
        {config.name}
      </div>
    );
  }

  if (config.type === "adsense") {
    return (
      <AdSensePlaceholder
        slot={config.adsenseSlotId}
        format={config.adsenseFormat || "auto"}
        className={className}
      />
    );
  }

  if (config.type === "banner") {
    const href = config.bannerAffiliate
      ? `/go/${config.bannerAffiliate}`
      : config.bannerUrl;

    if (!href || !config.bannerImage) return null;

    return (
      <div className={`my-8 ${className}`}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={config.bannerImage}
            alt={config.bannerImageAlt || ""}
            className="w-full rounded-lg"
          />
        </a>
      </div>
    );
  }

  if (config.type === "custom" && config.customHtml) {
    return (
      <div
        className={`my-8 ${className}`}
        dangerouslySetInnerHTML={{ __html: config.customHtml }}
      />
    );
  }

  return null;
}
