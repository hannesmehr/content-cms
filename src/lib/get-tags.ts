import { getPublishedArticles } from "./get-articles";
import { slugifyTag } from "./slugify-tag";

export { slugifyTag };

export async function getAllTags(
  siteSlug: string
): Promise<{ tag: string; count: number }[]> {
  const articles = await getPublishedArticles(siteSlug);
  const tagCounts = new Map<string, number>();

  for (const article of articles) {
    for (const tag of article.tags) {
      if (tag) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }
  }

  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => a.tag.localeCompare(b.tag, "de"));
}

export async function getArticlesByTag(tag: string, siteSlug: string) {
  const articles = await getPublishedArticles(siteSlug);
  return articles.filter((a) =>
    a.tags.some((t) => slugifyTag(t) === slugifyTag(tag))
  );
}
