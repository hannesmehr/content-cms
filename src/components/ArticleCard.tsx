import Link from "next/link";
import { Image } from "@/components/Image";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import type { Article } from "@/lib/get-articles";

type ArticleCardProps = {
  article: Article;
  categoryName?: string | null;
};

export function ArticleCard({ article, categoryName }: ArticleCardProps) {
  return (
    <article className="group">
      <Link href={`/${article.slug}`} className="block">
        <div className="relative aspect-[16/9] mb-3 overflow-hidden rounded-lg bg-gray-100">
          {article.image ? (
            <Image
              src={article.image}
              alt={article.imageAlt || article.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
        <h3 className="mt-1 text-lg font-semibold text-gray-900 group-hover:text-gray-600">
          {article.title}
        </h3>
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
          {article.description}
        </p>
      </Link>
    </article>
  );
}
