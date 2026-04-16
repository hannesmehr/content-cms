"use client";

type AffiliateBoxProps = {
  title: string;
  description?: string;
  linkUrl?: string;
  linkText?: string;
};

export function AffiliateBox({
  title,
  description,
  linkUrl,
  linkText = "Jetzt ansehen",
}: AffiliateBoxProps) {
  // Hide boxes with placeholder EXAMPLE links on the live site
  if (linkUrl?.includes("/dp/EXAMPLE")) return null;

  const href = linkUrl || "#";

  const handleClick = () => {
    try {
      (window as any).umami?.track("affiliate-box-click", {
        title,
        url: href,
      });
    } catch {}
  };

  return (
    <div className="not-prose my-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
      <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
        Anzeige
      </span>
      <p className="mt-1 font-semibold text-gray-900">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      )}
      <a
        href={href}
        target="_blank"
        rel="nofollow sponsored noopener"
        title={`${linkText}: ${title}`}
        className="mt-3 inline-block rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        onClick={handleClick}
      >
        {linkText} &rarr;
      </a>
    </div>
  );
}
