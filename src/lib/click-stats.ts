import { Redis } from "@upstash/redis";

// Lazy-Init: nur wenn Env-Vars vorhanden
let _redis: Redis | null = null;
function getRedis(): Redis | null {
  if (_redis) return _redis;
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  _redis = new Redis({ url, token });
  return _redis;
}

// Key-Schema: clicks:{slug}:{YYYY-MM} → number
// Set mit allen Slugs: clicks:slugs → Set<string>
// Set mit allen Monaten: clicks:months → Set<string>

function getMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Klick tracken — fire-and-forget, Fehler werden ignoriert.
 */
export async function trackClick(slug: string): Promise<void> {
  try {
    const redis = getRedis();
    if (!redis) return;
    const month = getMonth();
    const key = `clicks:${slug}:${month}`;
    await Promise.all([
      redis.incr(key),
      redis.sadd("clicks:slugs", slug),
      redis.sadd("clicks:months", month),
    ]);
  } catch {
    // Silently fail — Redis nicht konfiguriert (z.B. lokal ohne Env-Vars)
  }
}

export type ClickData = Record<string, Record<string, number>>;

/**
 * Alle Klickdaten laden — für die Admin-Stats-Seite.
 */
export async function getAllClickData(): Promise<{
  data: ClickData;
  months: string[];
}> {
  try {
    const redis = getRedis();
    if (!redis) return { data: {}, months: [] };

    const [slugs, months] = await Promise.all([
      redis.smembers("clicks:slugs") as Promise<string[]>,
      redis.smembers("clicks:months") as Promise<string[]>,
    ]);

    if (!slugs.length || !months.length) {
      return { data: {}, months: [] };
    }

    const sortedMonths = months.sort().reverse();
    const data: ClickData = {};

    // Alle Keys auf einmal abfragen (Pipeline)
    const keys = slugs.flatMap((slug) =>
      sortedMonths.map((month) => `clicks:${slug}:${month}`)
    );
    const values = await redis.mget<(number | null)[]>(...keys);

    let i = 0;
    for (const slug of slugs) {
      data[slug] = {};
      for (const month of sortedMonths) {
        const val = values[i++];
        if (val) data[slug][month] = val;
      }
    }

    return { data, months: sortedMonths };
  } catch {
    return { data: {}, months: [] };
  }
}
