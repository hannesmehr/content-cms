import Link from "next/link";
import LexicalContent from "./LexicalContent";
import { AdSlot } from "./AdSlot";
import { Breadcrumbs } from "./Breadcrumbs";
import { slugifyTag } from "@/lib/get-tags";
import type { AdConfig } from "@/lib/get-ad-config";

type ArticlePageProps = {
  title: string;
  description: string;
  content: any;
  category?: { name: string; slug: string } | null;
  tags?: readonly string[];
  sponsored?: boolean;
  breadcrumbs: { label: string; href?: string }[];
  siteUrl?: string;
  ads: Record<string, AdConfig | null>;
  enableAds?: boolean;
  enableAffiliates?: boolean;
};

export function ArticlePage({
  title,
  description,
  content,
  category,
  tags,
  sponsored,
  breadcrumbs,
  siteUrl,
  ads,
  enableAds,
  enableAffiliates,
}: ArticlePageProps) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Breadcrumbs items={breadcrumbs} siteUrl={siteUrl} />

      <header className="mb-8">
        {sponsored && (
          <span className="block text-right text-[10px] uppercase tracking-wider text-gray-400 font-medium">
            Anzeige
          </span>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-lg text-gray-600">{description}</p>
        {(category || (tags && tags.length > 0)) && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {category && (
              <Link
                href={`/kategorie/${category.slug}`}
                className="text-xs font-medium text-primary-700 bg-primary-50 px-2 py-0.5 rounded hover:bg-primary-100"
              >
                {category.name}
              </Link>
            )}
            {category && tags && tags.length > 0 && (
              <span className="text-gray-300">|</span>
            )}
            {tags && tags.map((tag) => (
              <Link
                key={tag}
                href={`/tag/${slugifyTag(tag)}`}
                className="text-xs text-accent-700 bg-accent-50 px-2 py-0.5 rounded hover:bg-accent-100"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </header>

      <AdSlot config={ads["article-before-content"]} />

      <div className="prose prose-gray max-w-none">
        <LexicalContent data={content} enableAds={enableAds} enableAffiliates={enableAffiliates} />
      </div>

      <AdSlot config={ads["article-after-content"]} />
    </article>
  );
}
