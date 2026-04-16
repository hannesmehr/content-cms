"use client";

type AffiliateLinkProps = {
  text?: string;
  linkUrl?: string;
  href?: string;
  children?: React.ReactNode;
};

export function AffiliateLink({ text, linkUrl, href: hrefProp, children }: AffiliateLinkProps) {
  const url = linkUrl || hrefProp || "#";
  const label = children || text || "";

  // Hide links with placeholder EXAMPLE URLs
  if (url.includes("/dp/EXAMPLE")) return <>{label}</>;

  const handleClick = () => {
    try {
      const linkText = typeof label === "string" ? label : text || "unknown";
      (window as any).umami?.track("affiliate-link-click", {
        text: linkText,
        url,
      });
    } catch {}
  };

  return (
    <span className="affiliate-link-wrapper">
      <a
        href={url}
        target="_blank"
        rel="nofollow sponsored noopener"
        title={typeof label === "string" ? label : undefined}
        className="text-primary-600 underline decoration-primary-300 underline-offset-2 hover:text-primary-700 hover:decoration-primary-500"
        onClick={handleClick}
      >
        {label}
      </a>
      <span
        className="text-[10px] text-gray-400 align-super cursor-help ml-[1px]"
        title="Affiliate-Link / Anzeige"
      >
        *
      </span>
    </span>
  );
}
