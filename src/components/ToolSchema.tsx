type FaqItem = {
  question: string;
  answer: string;
};

type ToolSchemaProps = {
  title: string;
  shortTitle: string;
  description: string;
  url: string;
  siteName: string;
  siteUrl: string;
  faqItems?: FaqItem[];
};

export function ToolSchema({
  title,
  shortTitle,
  description,
  url,
  siteName,
  siteUrl,
  faqItems,
}: ToolSchemaProps) {
  const schemas: object[] = [];

  // BreadcrumbList schema
  schemas.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Startseite",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Tools & Rechner",
        item: `${siteUrl}/tools`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: shortTitle,
        item: url,
      },
    ],
  });

  // WebApplication schema for the tool itself
  schemas.push({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: title,
    description,
    url,
    applicationCategory: "UtilityApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
    provider: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
    },
    inLanguage: "de-DE",
  });

  // FAQPage schema if FAQ items exist
  if (faqItems && faqItems.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    });
  }

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
