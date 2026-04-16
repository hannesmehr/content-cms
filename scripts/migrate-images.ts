/**
 * Migrate image paths from MDX frontmatter into Posts.imageUrl field.
 *
 * Usage: PAYLOAD_EMAIL=... PAYLOAD_PASSWORD=... npx tsx scripts/migrate-images.ts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = process.env.API_BASE || "http://localhost:3002";
const CONTENT_ROOT = path.resolve(__dirname, "../../content-template/content");

let authToken: string | null = null;

async function login(): Promise<string> {
  if (authToken) return authToken;
  const res = await fetch(`${API_BASE}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.PAYLOAD_EMAIL,
      password: process.env.PAYLOAD_PASSWORD,
    }),
  });
  const data = (await res.json()) as { token?: string };
  if (!data.token) throw new Error("Login failed");
  authToken = data.token;
  return authToken;
}

async function api(method: string, apiPath: string, body?: unknown): Promise<unknown> {
  const token = await login();
  const res = await fetch(`${API_BASE}${apiPath}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function main() {
  const sitesDir = path.join(CONTENT_ROOT, "sites");
  const siteDirs = fs.readdirSync(sitesDir, { withFileTypes: true })
    .filter(d => d.isDirectory()).map(d => d.name);

  let updated = 0;

  for (const siteSlug of siteDirs) {
    const postsDir = path.join(sitesDir, siteSlug, "posts");
    if (!fs.existsSync(postsDir)) continue;

    const posts = fs.readdirSync(postsDir, { withFileTypes: true })
      .filter(d => d.isDirectory());

    console.log(`\n--- ${siteSlug}: ${posts.length} posts ---`);

    for (const post of posts) {
      const mdxPath = path.join(postsDir, post.name, "index.mdx");
      if (!fs.existsSync(mdxPath)) continue;

      const content = fs.readFileSync(mdxPath, "utf-8");
      const match = content.match(/^---\n([\s\S]*?)\n---/);
      if (!match) continue;

      const fm = yaml.parse(match[1]);
      const imageUrl = fm.image as string | undefined;
      if (!imageUrl) continue;

      // Find post by slug
      const search = (await api("GET",
        `/api/posts?where%5Bslug%5D%5Bequals%5D=${post.name}&limit=1&depth=0`
      )) as { docs: { id: number }[] };

      const postId = search.docs?.[0]?.id;
      if (!postId) continue;

      await api("PATCH", `/api/posts/${postId}`, { imageUrl });
      updated++;
      if (updated % 50 === 0) console.log(`  ... ${updated} updated`);
    }
  }

  console.log(`\n=== Done: ${updated} image URLs set ===`);
}

main().catch(console.error);
