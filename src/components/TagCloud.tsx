"use client";

import { useState } from "react";
import Link from "next/link";
import { Image } from "@/components/Image";
import { slugifyTag } from "@/lib/slugify-tag";

type TagCloudArticle = {
  slug: string;
  title: string;
  description: string;
  image: string | null;
  imageAlt: string | null;
  tags: readonly string[];
};

const lineClampClass: Record<number, string> = {
  1: "line-clamp-1",
  2: "line-clamp-2",
  3: "line-clamp-3",
};

type TagCloudProps = {
  tags: string[];
  articles: TagCloudArticle[];
  showDescription?: boolean;
  descriptionLines?: number;
};

export function TagCloud({ tags, articles, showDescription = false, descriptionLines = 1 }: TagCloudProps) {
  const [activeTag, setActiveTag] = useState(tags[0] || "");

  if (tags.length === 0) return null;

  const activeSlug = slugifyTag(activeTag);
  const filtered = articles.filter((a) =>
    a.tags.some((t) => slugifyTag(t) === activeSlug)
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setActiveTag(tag)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              tag === activeTag
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.slice(0, 4).map((article) => (
          <Link
            key={article.slug}
            href={`/${article.slug}`}
            className="group flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {article.image && (
              <div className="relative w-20 h-14 shrink-0 overflow-hidden rounded-md bg-gray-100">
                <Image
                  src={article.image}
                  alt={article.imageAlt || article.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-gray-900 group-hover:text-gray-600 line-clamp-2 leading-snug">
                {article.title}
              </h4>
              {showDescription && article.description && (
                <p className={`mt-0.5 text-xs text-gray-500 ${lineClampClass[descriptionLines] || "line-clamp-1"}`}>
                  {article.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {filtered.length > 0 && (
        <Link
          href={`/tag/${activeSlug}`}
          title={`Alle Artikel zum Thema ${activeTag} anzeigen`}
          className="inline-block mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Alle Artikel zu &bdquo;{activeTag}&ldquo; &rarr;
        </Link>
      )}
    </div>
  );
}
