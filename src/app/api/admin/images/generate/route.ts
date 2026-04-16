import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import {
  generateImagePrompt,
  generateAltText,
  generateImage,
  uploadToBlob,
  saveImageMetadata,
  getImageForArticle,
} from "@/lib/image-gen";

export const maxDuration = 60; // fal.ai can take a while

type RequestBody = {
  articleSlug: string;
  siteSlug: string;
  dryRun?: boolean;
  force?: boolean;
  customPrompt?: string;
  customAltText?: string;
};

function parseFrontmatter(raw: string): Record<string, string | string[]> {
  const fm: Record<string, string | string[]> = {};
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return fm;

  let currentKey = "";
  let inArray = false;
  const arrayValues: string[] = [];

  for (const line of match[1].split("\n")) {
    if (line.startsWith("  - ") && inArray) {
      arrayValues.push(line.replace("  - ", "").trim());
      continue;
    }

    if (inArray && currentKey) {
      fm[currentKey] = [...arrayValues];
      inArray = false;
      arrayValues.length = 0;
    }

    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const val = line
      .slice(idx + 1)
      .trim()
      .replace(/^["']|["']$/g, "");

    if (val === "") {
      // Start of array
      currentKey = key;
      inArray = true;
      arrayValues.length = 0;
    } else {
      fm[key] = val;
    }
  }

  if (inArray && currentKey) {
    fm[currentKey] = [...arrayValues];
  }

  return fm;
}

export async function POST(request: Request) {
  // Auth check
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: RequestBody = await request.json();
  const { articleSlug, siteSlug, dryRun = false, force = false, customPrompt, customAltText } = body;

  if (!articleSlug || !siteSlug) {
    return NextResponse.json(
      { error: "articleSlug and siteSlug are required" },
      { status: 400 }
    );
  }

  // Read article frontmatter
  const mdxPath = join(
    process.cwd(),
    "content",
    "sites",
    siteSlug,
    "posts",
    articleSlug,
    "index.mdx"
  );
  if (!existsSync(mdxPath)) {
    return NextResponse.json(
      { error: `Article not found: ${siteSlug}/${articleSlug}` },
      { status: 404 }
    );
  }

  const raw = readFileSync(mdxPath, "utf-8");
  const fm = parseFrontmatter(raw);

  // Extract first paragraph (content after frontmatter)
  const contentStart = raw.indexOf("---", 3);
  const content = contentStart > -1 ? raw.slice(contentStart + 3).trim() : "";
  const firstParagraph = content
    .split("\n\n")
    .find((p) => p.trim() && !p.startsWith("#") && !p.startsWith("<"))
    ?.trim()
    .slice(0, 300) || "";

  // Load site description for prompt context
  let siteContext = "";
  const siteYamlPath = join(process.cwd(), "content", "sites", siteSlug, "index.yaml");
  if (existsSync(siteYamlPath)) {
    const siteYaml = readFileSync(siteYamlPath, "utf-8");
    const descMatch = siteYaml.match(/description:\s*(.+)/);
    if (descMatch) siteContext = descMatch[1].trim();
  }

  const article = {
    title: (fm.title as string) || articleSlug,
    description: (fm.description as string) || "",
    category: (fm.category as string) || null,
    tags: (fm.tags as string[]) || [],
    firstParagraph,
    siteContext,
  };

  // Generate prompt and alt text via Claude Haiku (or use custom ones)
  const prompt = customPrompt || await generateImagePrompt(article);
  const altText = customAltText || await generateAltText(article);

  // Check if image already exists (cost control)
  if (!force) {
    const existing = await getImageForArticle(siteSlug, articleSlug);
    if (existing) {
      return NextResponse.json({
        warning: "Bild bereits vorhanden. Nutze force:true um neu zu generieren.",
        existing: {
          id: existing.id,
          blobUrl: existing.blobUrl,
          prompt: existing.prompt,
          altText: existing.altText,
          createdAt: existing.createdAt,
        },
        newPrompt: prompt,
        newAltText: altText,
      });
    }
  }

  // Dry run: return prompt for approval
  if (dryRun) {
    return NextResponse.json({
      dryRun: true,
      articleSlug,
      siteSlug,
      title: article.title,
      prompt,
      altText,
      estimatedCost: "$0.025 (fal.ai flux/dev)",
    });
  }

  // Check required env vars
  if (!process.env.FAL_KEY) {
    return NextResponse.json(
      { error: "FAL_KEY not configured" },
      { status: 503 }
    );
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN not configured" },
      { status: 503 }
    );
  }

  try {
    // Generate image via fal.ai
    const { url: falUrl } = await generateImage(prompt);

    // Upload to Vercel Blob
    const blobPath = `images/posts/${articleSlug}/${articleSlug}.webp`;
    const blobUrl = await uploadToBlob(falUrl, blobPath);

    // Derive tags for Redis from article tags
    const imageTags = article.tags.map((t) => t.toLowerCase());
    if (article.category) imageTags.push(article.category);

    // Save metadata to Redis
    const meta = await saveImageMetadata({
      blobUrl,
      prompt,
      altText,
      tags: imageTags,
      siteSlug,
      articleSlug,
      model: "fal-ai/flux/dev",
      width: 1536,
      height: 1024,
    });

    // Frontmatter uses /media/ rewrite path instead of full Blob URL
    const frontmatterImage = `/media/${blobPath}`;

    return NextResponse.json({
      ok: true,
      image: meta,
      frontmatterUpdate: {
        image: frontmatterImage,
        imageAlt: altText,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Image generation failed",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
