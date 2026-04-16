/**
 * Content Migration Script: MDX (content-template) → Payload CMS
 *
 * Reads MDX files from the old content-template codebase and imports them
 * into the Payload CMS database via REST API.
 *
 * Usage:
 *   1. Start the dev server: npm run dev
 *   2. Login at /admin and copy the token from the response
 *   3. Run: PAYLOAD_TOKEN=<token> npx tsx scripts/migrate-content.ts
 *
 * Or run with email/password:
 *   PAYLOAD_EMAIL=hannes@infected.de PAYLOAD_PASSWORD=yourpass npx tsx scripts/migrate-content.ts
 */

import fs from "fs";
import path from "path";
import yaml from "yaml";

const API_BASE = process.env.API_BASE || "http://localhost:3002";
const CONTENT_ROOT = path.resolve(
  __dirname,
  "../../content-template/content"
);

let authToken: string | null = process.env.PAYLOAD_TOKEN || null;

// --- Auth ---

async function login(): Promise<string> {
  if (authToken) return authToken;

  const email = process.env.PAYLOAD_EMAIL;
  const password = process.env.PAYLOAD_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "Set PAYLOAD_TOKEN or PAYLOAD_EMAIL+PAYLOAD_PASSWORD env vars"
    );
  }

  const res = await fetch(`${API_BASE}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!data.token) throw new Error(`Login failed: ${JSON.stringify(data)}`);
  authToken = data.token;
  return authToken!;
}

async function api(
  method: string,
  path: string,
  body?: unknown
): Promise<unknown> {
  const token = await login();
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`API ${method} ${path} failed:`, JSON.stringify(data).slice(0, 200));
  }
  return data;
}

// --- Helpers ---

function readYaml(filePath: string): Record<string, unknown> {
  const content = fs.readFileSync(filePath, "utf-8");
  return yaml.parse(content) || {};
}

function readMdxFrontmatter(
  filePath: string
): { frontmatter: Record<string, unknown>; body: string } {
  const content = fs.readFileSync(filePath, "utf-8");
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };
  return {
    frontmatter: yaml.parse(match[1]) || {},
    body: match[2].trim(),
  };
}

function getSiteDirs(): string[] {
  const sitesDir = path.join(CONTENT_ROOT, "sites");
  if (!fs.existsSync(sitesDir)) return [];
  return fs
    .readdirSync(sitesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

// --- Migration Steps ---

const siteIdMap = new Map<string, string>(); // slug → payload ID
const categoryIdMap = new Map<string, string>(); // "siteSlug/catSlug" → payload ID

async function migrateSites() {
  console.log("\n=== Migrating Sites ===");
  for (const siteSlug of getSiteDirs()) {
    const configPath = path.join(
      CONTENT_ROOT,
      "sites",
      siteSlug,
      "index.yaml"
    );
    if (!fs.existsSync(configPath)) continue;

    const data = readYaml(configPath);
    const payload: Record<string, unknown> = {
      name: data.name || siteSlug,
      slug: siteSlug,
      domain: data.domain || "",
      description: data.description || "",
      themePreset: data.themePreset || "blue",
      enableAds: data.enableAds ?? false,
      enableAffiliates: data.enableAffiliates ?? false,
      umamiWebsiteId: data.umamiWebsiteId || "",
      adsenseClientId: data.adsenseClientId || "",
      comingSoon: data.comingSoon ?? false,
      showSidebar: data.showSidebar ?? true,
    };

    const result = (await api("POST", "/api/sites", payload)) as {
      doc?: { id: string };
      errors?: unknown[];
    };
    if (result.doc?.id) {
      siteIdMap.set(siteSlug, result.doc.id);
      console.log(`  ✓ Site: ${siteSlug} → ${result.doc.id}`);
    } else {
      console.log(`  ✗ Site: ${siteSlug} — ${JSON.stringify(result.errors || result).slice(0, 100)}`);
    }
  }
}

async function migrateCategories() {
  console.log("\n=== Migrating Categories ===");
  for (const siteSlug of getSiteDirs()) {
    const siteId = siteIdMap.get(siteSlug);
    if (!siteId) continue;

    const catDir = path.join(CONTENT_ROOT, "sites", siteSlug, "categories");
    if (!fs.existsSync(catDir)) continue;

    const cats = fs
      .readdirSync(catDir, { withFileTypes: true })
      .filter((d) => d.isDirectory());

    for (const cat of cats) {
      const catPath = path.join(catDir, cat.name, "index.yaml");
      const data = fs.existsSync(catPath) ? readYaml(catPath) : {};

      const payload = {
        name: data.name || cat.name,
        slug: cat.name,
        description: data.description || "",
        site: siteId,
      };

      const result = (await api("POST", "/api/categories", payload)) as {
        doc?: { id: string };
      };
      if (result.doc?.id) {
        categoryIdMap.set(`${siteSlug}/${cat.name}`, result.doc.id);
        console.log(`  ✓ Category: ${siteSlug}/${cat.name}`);
      }
    }
  }
}

async function migratePosts() {
  console.log("\n=== Migrating Posts ===");
  let total = 0;
  let success = 0;

  for (const siteSlug of getSiteDirs()) {
    const siteId = siteIdMap.get(siteSlug);
    if (!siteId) continue;

    const postsDir = path.join(CONTENT_ROOT, "sites", siteSlug, "posts");
    if (!fs.existsSync(postsDir)) continue;

    const posts = fs
      .readdirSync(postsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory());

    for (const post of posts) {
      total++;
      const mdxPath = path.join(postsDir, post.name, "index.mdx");
      if (!fs.existsSync(mdxPath)) continue;

      const { frontmatter, body } = readMdxFrontmatter(mdxPath);

      // Resolve category
      const catSlug = frontmatter.category as string | undefined;
      const categoryId = catSlug
        ? categoryIdMap.get(`${siteSlug}/${catSlug}`)
        : undefined;

      // Tags: convert from array of strings
      const tags = Array.isArray(frontmatter.tags)
        ? frontmatter.tags.map((t: string) => ({ tag: String(t) }))
        : [];

      // RedirectFrom
      const redirectFrom = Array.isArray(frontmatter.redirectFrom)
        ? frontmatter.redirectFrom.map((s: string) => ({ slug: s }))
        : [];

      // For now, store the MDX body as a simple rich text paragraph
      // The full MDX→Lexical conversion will be done in a second pass
      const payload: Record<string, unknown> = {
        title: frontmatter.title || post.name,
        slug: post.name,
        description: frontmatter.description || "",
        date: frontmatter.date
          ? new Date(frontmatter.date as string).toISOString()
          : new Date().toISOString(),
        lastFactCheck: frontmatter.lastFactCheck
          ? new Date(frontmatter.lastFactCheck as string).toISOString()
          : undefined,
        draft: frontmatter.draft ?? false,
        featured: frontmatter.featured ?? false,
        sponsored: frontmatter.sponsored ?? false,
        hideAds: frontmatter.hideAds ?? false,
        score: frontmatter.score ?? 0,
        reviewStatus: frontmatter.reviewStatus || "open",
        redirectFrom,
        site: siteId,
        category: categoryId || undefined,
        tags,
        imageAlt: frontmatter.imageAlt || "",
        // Store raw MDX body in a text field for now
        // content will be converted to Lexical in a second migration pass
        _rawMdx: body,
      };

      const result = (await api("POST", "/api/posts", payload)) as {
        doc?: { id: string };
        errors?: { message: string }[];
      };

      if (result.doc?.id) {
        success++;
        if (success % 20 === 0) console.log(`  ... ${success} posts migrated`);
      } else {
        console.log(
          `  ✗ Post: ${siteSlug}/${post.name} — ${
            result.errors?.[0]?.message || "unknown error"
          }`
        );
      }
    }
  }
  console.log(`  ✓ Posts: ${success}/${total} migrated`);
}

async function migratePages() {
  console.log("\n=== Migrating Pages ===");
  for (const siteSlug of getSiteDirs()) {
    const siteId = siteIdMap.get(siteSlug);
    if (!siteId) continue;

    const pagesDir = path.join(CONTENT_ROOT, "sites", siteSlug, "pages");
    if (!fs.existsSync(pagesDir)) continue;

    const pages = fs
      .readdirSync(pagesDir, { withFileTypes: true })
      .filter((d) => d.isDirectory());

    for (const page of pages) {
      const mdxPath = path.join(pagesDir, page.name, "index.mdx");
      if (!fs.existsSync(mdxPath)) continue;

      const { frontmatter } = readMdxFrontmatter(mdxPath);

      const payload = {
        title: frontmatter.title || page.name,
        slug: page.name,
        site: siteId,
      };

      const result = (await api("POST", "/api/pages", payload)) as {
        doc?: { id: string };
      };
      if (result.doc?.id) {
        console.log(`  ✓ Page: ${siteSlug}/${page.name}`);
      }
    }
  }
}

// --- Main ---

async function main() {
  console.log("Content Migration: content-template → Payload CMS");
  console.log(`API: ${API_BASE}`);
  console.log(`Content root: ${CONTENT_ROOT}`);

  if (!fs.existsSync(CONTENT_ROOT)) {
    console.error(
      "Content root not found. Make sure content-template is at:",
      CONTENT_ROOT
    );
    process.exit(1);
  }

  const siteDirs = getSiteDirs();
  console.log(`Found ${siteDirs.length} sites: ${siteDirs.join(", ")}`);

  await migrateSites();
  await migrateCategories();
  await migratePosts();
  await migratePages();

  console.log("\n=== Migration Complete ===");
  console.log(`Sites: ${siteIdMap.size}`);
  console.log(`Categories: ${categoryIdMap.size}`);
  console.log(
    "\nNote: Post content is stored as metadata only. Run the Lexical conversion script next."
  );
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
