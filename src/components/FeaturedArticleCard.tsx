import Link from "next/link";
import { Image } from "@/components/Image";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import type { Article } from "@/lib/get-articles";

type Props = {
  article: Article;
  categoryName?: string | null;
  className?: string;
};

export function FeaturedArticleCard({ article, categoryName, className }: Props) {
  return (
    <article className={`group mb-8 ${className || ""}`}>
      <Link href={`/${article.slug}`} className="block">
        <div className="relative aspect-[2/1] mb-4 overflow-hidden rounded-xl bg-gray-100">
          {article.image ? (
            <Image
              src={article.image}
              alt={article.imageAlt || article.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              priority
              sizes="(max-width: 1024px) 100vw, 800px"
            />
          ) : (
            <ImagePlaceholder />
          )}
        </div>
        {categoryName && (
          <span className="inline-block text-xs font-medium text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
            {categoryName}
          </span>
        )}
        <h2 className="mt-2 text-2xl font-bold text-gray-900 group-hover:text-gray-600 sm:text-3xl">
          {article.title}
        </h2>
        <p className="mt-2 text-gray-600 line-clamp-3">
          {article.description}
        </p>
      </Link>
    </article>
  );
}
