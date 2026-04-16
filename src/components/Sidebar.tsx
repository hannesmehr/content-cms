import Link from "next/link";
import type { Article } from "@/lib/get-articles";
import type { Category } from "@/lib/get-categories";

type SidebarProps = {
  recentArticles: Article[];
  categories: Category[];
  articleCountByCategory: Record<string, number>;
};

export function Sidebar({
  recentArticles,
  categories,
  articleCountByCategory,
}: SidebarProps) {
  return (
    <aside className="space-y-8">
      {/* Beliebte Artikel */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
          Beliebte Artikel
        </h3>
        <ul className="space-y-3">
          {recentArticles.slice(0, 5).map((article) => (
            <li key={article.slug}>
              <Link
                href={`/${article.slug}`}
                className="text-sm text-gray-700 hover:text-gray-900 leading-snug block"
              >
                {article.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Kategorien */}
      {categories.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            Kategorien
          </h3>
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/kategorie/${cat.slug}`}
                  className="flex items-center justify-between text-sm text-gray-700 hover:text-gray-900"
                >
                  <span>{cat.name}</span>
                  <span className="text-xs text-gray-400">
                    {articleCountByCategory[cat.slug] || 0}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Newsletter Platzhalter */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">
          Newsletter
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          Erhalte die neuesten Artikel direkt in dein Postfach.
        </p>
        <div className="bg-gray-200 rounded-md py-3 text-center text-xs text-gray-500">
          Newsletter-Formular Platzhalter
        </div>
      </div>
    </aside>
  );
}
