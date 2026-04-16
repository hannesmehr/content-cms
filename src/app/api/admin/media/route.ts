import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { getAllSiteSlugs } from "@/lib/get-sites";
import type { ImageMetadata } from "@/lib/image-gen";

function getRedis(): Redis | null {
  const url =
    process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

async function loadImagesForSite(
  redis: Redis,
  siteSlug: string
): Promise<ImageMetadata[]> {
  const ids = (await redis.smembers(
    `images:site:${siteSlug}`
  )) as string[];
  if (!ids || ids.length === 0) return [];

  const keys = ids.map((id) => `image:${id}`);
  const rawItems = await redis.mget<string[]>(keys[0], ...keys.slice(1));

  const images: ImageMetadata[] = [];
  for (const raw of rawItems) {
    if (!raw) continue;
    const meta: ImageMetadata =
      typeof raw === "string" ? JSON.parse(raw) : raw;
    images.push(meta);
  }

  return images;
}

export async function GET(request: Request) {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { error: "Redis not configured" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const siteSlugParam = searchParams.get("siteSlug");

  let siteSlugs: string[];
  if (siteSlugParam) {
    siteSlugs = [siteSlugParam];
  } else {
    siteSlugs = await getAllSiteSlugs();
  }

  const allImages: ImageMetadata[] = [];

  for (const slug of siteSlugs) {
    const images = await loadImagesForSite(redis, slug);
    allImages.push(...images);
  }

  // Sort by createdAt descending, limit to 100
  allImages.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json({
    images: allImages.slice(0, 100),
    total: allImages.length,
  });
}
