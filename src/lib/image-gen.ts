import { Redis } from "@upstash/redis";
import { put } from "@vercel/blob";
import { fal } from "@fal-ai/client";
import { generateText } from "ai";
import { gateway } from "@ai-sdk/gateway";

// ── Types ───────────────────────────────────────────────────────────

export type ImageMetadata = {
  id: string;
  blobUrl: string;
  prompt: string;
  altText: string;
  tags: string[];
  siteSlug: string;
  articleSlug: string | null;
  model: string;
  width: number;
  height: number;
  createdAt: string;
};

export type ArticleInfo = {
  title: string;
  description: string;
  category: string | null;
  tags: readonly string[];
  firstParagraph?: string;
  siteContext?: string; // Site description for prompt context
};

// ── Redis (lazy init, same pattern as click-stats.ts) ───────────────

let _redis: Redis | null | false = null;
function getRedis(): Redis | null {
  if (_redis === false) return null;
  if (_redis) return _redis;
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    _redis = false;
    return null;
  }
  _redis = new Redis({ url, token });
  return _redis;
}

// ── Prompt Generation (via Claude Haiku) ────────────────────────────

function buildImageSystemPrompt(siteContext?: string): string {
  const contextRule = siteContext
    ? `- Website-Kontext: ${siteContext}`
    : "";
  return `Du bist ein Experte für Bildgenerierung mit Flux AI. Erstelle einen präzisen englischen Bild-Prompt für ein professionelles Foto. Regeln:
- Beschreibe das konkrete Hauptobjekt sehr spezifisch
${contextRule}
- Keine Menschen im Bild
- Kein sichtbarer Text auf Produkten
- Anhängen: 'professional photography, natural lighting, high quality, sharp focus, no people, no visible text, no watermarks, 3:2 landscape aspect ratio'
- Nur den Prompt zurückgeben, kein JSON, keine Erklärung`;
}

const ALT_TEXT_SYSTEM_PROMPT = `Erstelle einen SEO-optimierten deutschen Alt-Text für ein Artikelbild. Format: "{Hauptkeyword} – {kurze Beschreibung was auf dem Bild zu sehen ist}". Maximal 80 Zeichen. Nur den Alt-Text zurückgeben, keine Erklärung.`;

export async function generateImagePrompt(article: ArticleInfo): Promise<string> {
  const userMessage = [
    `Artikel: ${article.title}`,
    `Beschreibung: ${article.description}`,
    `Kategorie: ${article.category || "allgemein"}`,
    `Tags: ${article.tags.join(", ")}`,
    article.firstParagraph ? `Erster Absatz: ${article.firstParagraph}` : "",
    "",
    "Erstelle einen Flux-Bild-Prompt der das Hauptthema als realistisches Produktfoto zeigt.",
  ].filter(Boolean).join("\n");

  const { text } = await generateText({
    model: gateway("anthropic/claude-haiku-4-5-20251001"),
    system: buildImageSystemPrompt(article.siteContext),
    prompt: userMessage,
  });

  return text.trim();
}

export async function generateAltText(article: ArticleInfo): Promise<string> {
  const { text } = await generateText({
    model: gateway("anthropic/claude-haiku-4-5-20251001"),
    system: ALT_TEXT_SYSTEM_PROMPT,
    prompt: `Artikel: ${article.title}\nBeschreibung: ${article.description}\nKategorie: ${article.category || "allgemein"}`,
  });

  return text.trim().replace(/^["']|["']$/g, "");
}

// ── fal.ai Image Generation ─────────────────────────────────────────

export async function generateImage(
  prompt: string,
  opts?: { model?: string; width?: number; height?: number }
): Promise<{ url: string }> {
  const model = opts?.model || "fal-ai/flux/dev";
  const width = opts?.width || 1536;
  const height = opts?.height || 1024;

  fal.config({ credentials: process.env.FAL_KEY });

  const result = await fal.subscribe(model, {
    input: {
      prompt,
      image_size: { width, height },
      num_images: 1,
    },
  });

  const images = (result.data as { images?: { url: string }[] })?.images;
  if (!images || images.length === 0) {
    throw new Error("fal.ai returned no images");
  }

  return { url: images[0].url };
}

// ── Vercel Blob Upload ──────────────────────────────────────────────

export async function uploadToBlob(
  imageUrl: string,
  blobPath: string
): Promise<string> {
  // Download image from fal.ai
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }
  const imageBuffer = await response.arrayBuffer();

  // Upload to Vercel Blob
  const blob = await put(blobPath, Buffer.from(imageBuffer), {
    access: "public",
    contentType: "image/webp",
    addRandomSuffix: false,
  });

  return blob.url;
}

// ── Redis Metadata Operations ───────────────────────────────────────

function generateId(): string {
  return `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function saveImageMetadata(
  meta: Omit<ImageMetadata, "id" | "createdAt">
): Promise<ImageMetadata> {
  const redis = getRedis();
  if (!redis) throw new Error("Redis not configured");

  const id = generateId();
  const fullMeta: ImageMetadata = {
    ...meta,
    id,
    createdAt: new Date().toISOString(),
  };

  // Store all data
  await Promise.all([
    redis.set(`image:${id}`, JSON.stringify(fullMeta)),
    redis.sadd(`images:site:${meta.siteSlug}`, id),
    ...(meta.articleSlug
      ? [redis.set(`images:article:${meta.siteSlug}:${meta.articleSlug}`, id)]
      : []),
    ...meta.tags.map((tag) =>
      redis.sadd(`images:tag:${tag.toLowerCase()}`, id)
    ),
  ]);

  return fullMeta;
}

export async function getImageForArticle(
  siteSlug: string,
  articleSlug: string
): Promise<ImageMetadata | null> {
  const redis = getRedis();
  if (!redis) return null;

  const imageId = await redis.get<string>(
    `images:article:${siteSlug}:${articleSlug}`
  );
  if (!imageId) return null;

  const raw = await redis.get<string>(`image:${imageId}`);
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

export async function searchImagesByTags(
  tags: string[],
  siteSlug: string
): Promise<ImageMetadata[]> {
  const redis = getRedis();
  if (!redis) return [];

  const tagKeys = tags.map((t) => `images:tag:${t.toLowerCase()}`);
  if (tagKeys.length === 0) return [];

  // Get all imageIds matching any of the tags
  const imageIds = await redis.sunion(tagKeys[0], ...tagKeys.slice(1)) as string[];
  if (!imageIds || imageIds.length === 0) return [];

  // Load metadata and filter by site
  const keys = imageIds.map((id) => `image:${id}`);
  const rawItems = await redis.mget<string[]>(keys[0], ...keys.slice(1));

  const results: ImageMetadata[] = [];
  for (const raw of rawItems) {
    if (!raw) continue;
    const meta: ImageMetadata =
      typeof raw === "string" ? JSON.parse(raw) : raw;
    if (meta.siteSlug === siteSlug) {
      results.push(meta);
    }
  }

  return results.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// Delete an image from Redis (not from Blob — Vercel Blob has no delete API in free tier)
export async function deleteImage(imageId: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;

  // Load metadata first to know what keys to clean up
  const raw = await redis.get<string>(`image:${imageId}`);
  if (!raw) return false;

  const meta: ImageMetadata = typeof raw === "string" ? JSON.parse(raw) : raw;

  // Check if this is the active image for its article
  const activeId = meta.articleSlug
    ? await redis.get<string>(`images:article:${meta.siteSlug}:${meta.articleSlug}`)
    : null;
  const isActive = activeId === imageId;

  // Remove from all Redis keys
  await Promise.all([
    redis.del(`image:${imageId}`),
    redis.srem(`images:site:${meta.siteSlug}`, imageId),
    ...(isActive && meta.articleSlug
      ? [redis.del(`images:article:${meta.siteSlug}:${meta.articleSlug}`)]
      : []),
    ...meta.tags.map((tag) =>
      redis.srem(`images:tag:${tag.toLowerCase()}`, imageId)
    ),
  ]);

  return true;
}

// Get the active image ID for an article (the one referenced in frontmatter)
export async function getActiveImageId(
  siteSlug: string,
  articleSlug: string
): Promise<string | null> {
  const redis = getRedis();
  if (!redis) return null;
  return redis.get<string>(`images:article:${siteSlug}:${articleSlug}`);
}
