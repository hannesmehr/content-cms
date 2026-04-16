import Link from "next/link";
import { Image } from "@/components/Image";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import type { Article } from "@/lib/get-articles";

type CompactArticleCardProps = {
  article: Article;
  categoryName?: string | null;
  showDescription?: boolean;
  descriptionLines?: number;
};

const lineClampClass: Record<number, string> = {
  1: "line-clamp-1",
  2: "line-clamp-2",
  3: "line-clamp-3",
};

export function CompactArticleCard({
  article,
  categoryName,
  showDescription = false,
  descriptionLines = 1,
}: CompactArticleCardProps) {
  return (
    <Link href={`/${article.slug}`} className="group flex gap-4 py-3">
      <div className="relative w-24 h-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
        {article.image ? (
          <Image
            src={article.image}
            alt={article.imageAlt || article.title}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <ImagePlaceholder />
        )}
      </div>
      <div className="min-w-0 flex-1">
        {categoryName && (
          <span className="text-[11px] font-medium text-primary-700">
            {categoryName}
          </span>
        )}
        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-gray-600 line-clamp-2 leading-snug">
          {article.title}
        </h3>
        {showDescription && article.description && (
          <p className={`mt-0.5 text-xs text-gray-500 ${lineClampClass[descriptionLines] || "line-clamp-1"}`}>
            {article.description}
          </p>
        )}
      </div>
    </Link>
  );
}
