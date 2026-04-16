import { NextResponse } from "next/server";
import { searchImagesByTags } from "@/lib/image-gen";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tagsParam = searchParams.get("tags");
  const siteSlug = searchParams.get("siteSlug");

  if (!tagsParam || !siteSlug) {
    return NextResponse.json(
      { error: "tags and siteSlug are required" },
      { status: 400 }
    );
  }

  const tags = tagsParam.split(",").map((t) => t.trim().toLowerCase());

  try {
    const results = await searchImagesByTags(tags, siteSlug);
    return NextResponse.json({
      query: { tags, siteSlug },
      count: results.length,
      images: results.map((img) => ({
        id: img.id,
        blobUrl: img.blobUrl,
        altText: img.altText,
        tags: img.tags,
        articleSlug: img.articleSlug,
        createdAt: img.createdAt,
      })),
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Search failed",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
