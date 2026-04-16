import Link from "next/link";
import type { Article } from "@/lib/get-articles";
import { CompactArticleCard } from "./CompactArticleCard";

type CategoryArticleSectionProps = {
  categoryName: string;
  categorySlug: string;
  articles: Article[];
  showDescription?: boolean;
  descriptionLines?: number;
};

export function CategoryArticleSection({
  categoryName,
  categorySlug,
  articles,
  showDescription = false,
  descriptionLines = 1,
}: CategoryArticleSectionProps) {
  if (articles.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-gray-900">{categoryName}</h3>
        <Link
          href={`/kategorie/${categorySlug}`}
          title={`Alle Artikel in ${categoryName} anzeigen`}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Alle Artikel &rarr;
        </Link>
      </div>
      <div className="divide-y divide-gray-100">
        {articles.map((article) => (
          <CompactArticleCard key={article.slug} article={article} showDescription={showDescription} descriptionLines={descriptionLines} />
        ))}
      </div>
    </div>
  );
}
