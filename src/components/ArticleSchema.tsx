type ArticleSchemaProps = {
  title: string;
  description: string;
  date: string;
  url: string;
  image?: string | null;
  imageAlt?: string | null;
  siteName: string;
  siteUrl: string;
  categoryName?: string | null;
  tags?: readonly string[];
};

export function ArticleSchema({
  title,
  description,
  date,
  url,
  image,
  imageAlt,
  siteName,
  siteUrl,
  categoryName,
  tags,
}: ArticleSchemaProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    datePublished: date,
    dateModified: date,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
    },
    ...(image && {
      image: {
        "@type": "ImageObject",
        url: image.startsWith("http") ? image : `${siteUrl}${image}`,
        ...(imageAlt && { description: imageAlt }),
      },
    }),
    ...(categoryName && {
      articleSection: categoryName,
    }),
    ...(tags &&
      tags.length > 0 && {
        keywords: tags.join(", "),
      }),
    inLanguage: "de-DE",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
