const envAdsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "";

type AdSensePlaceholderProps = {
  slot?: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
  clientId?: string;
};

export function AdSensePlaceholder({
  slot,
  format = "auto",
  className = "",
  clientId,
}: AdSensePlaceholderProps) {
  const adsenseClientId = clientId || envAdsenseClientId;

  if (!adsenseClientId) {
    return (
      <div
        className={`bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm py-8 my-8 ${className}`}
      >
        Werbung
      </div>
    );
  }

  return (
    <div className={`my-8 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adsenseClientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
