/**
 * Content CLI — Create and update articles via Payload REST API.
 * This is how Claude Code manages content (instead of direct file writes).
 *
 * Usage:
 *   # List posts for a site
 *   npx tsx scripts/content-cli.ts list --site wohnwagenratgeber-de
 *
 *   # Get a single post
 *   npx tsx scripts/content-cli.ts get --slug wohnwagen-neuheiten-trends-2026
 *
 *   # Create a new post (content as HTML, auto-converted to Lexical)
 *   npx tsx scripts/content-cli.ts create --site wohnwagenratgeber-de \
 *     --title "Neuer Artikel" --slug neuer-artikel \
 *     --description "Beschreibung" --category kauf-verkauf \
 *     --html "<p>Artikel-Text...</p><h2>Heading</h2><p>Mehr Text</p>"
 *
 *   # Create from markdown file
 *   npx tsx scripts/content-cli.ts create --site wohnwagenratgeber-de \
 *     --title "Neuer Artikel" --slug neuer-artikel \
 *     --description "Beschreibung" --category kauf-verkauf \
 *     --markdown-file /path/to/article.md
 *
 *   # Update a post field
 *   npx tsx scripts/content-cli.ts update --slug neuer-artikel \
 *     --field title --value "Aktualisierter Titel"
 *
 *   # Update post content from HTML
 *   npx tsx scripts/content-cli.ts update --slug neuer-artikel \
 *     --html "<p>Neuer Content</p>"
 *
 *   # Update post content from markdown file
 *   npx tsx scripts/content-cli.ts update --slug neuer-artikel \
 *     --markdown-file /path/to/updated.md
 *
 * Environment:
 *   PAYLOAD_EMAIL, PAYLOAD_PASSWORD — or PAYLOAD_TOKEN
 *   API_BASE — default http://localhost:3002 (or production URL)
 */

import fs from "fs";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

const API_BASE = process.env.API_BASE || "http://localhost:3002";
let authToken: string | null = process.env.PAYLOAD_TOKEN || null;

// --- Auth ---
async function login(): Promise<string> {
  if (authToken) return authToken;
  const email = process.env.PAYLOAD_EMAIL;
  const password = process.env.PAYLOAD_PASSWORD;
  if (!email || !password) throw new Error("Set PAYLOAD_EMAIL+PAYLOAD_PASSWORD or PAYLOAD_TOKEN");

  const res = await fetch(`${API_BASE}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json()) as { token?: string };
  if (!data.token) throw new Error("Login failed");
  authToken = data.token;
  return authToken;
}

async function api(method: string, path: string, body?: unknown): Promise<unknown> {
  const token = await login();
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

// --- Helpers ---
async function markdownToHtml(md: string): Promise<string> {
  const result = await unified()
    .use(remarkParse).use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(md);
  return String(result);
}

async function htmlToLexical(html: string): Promise<object> {
  const result = (await api("POST", "/api/admin/convert-html", { html })) as { lexical?: object };
  if (!result.lexical) throw new Error("HTML→Lexical conversion failed");
  return result.lexical;
}

async function findSiteId(siteSlug: string): Promise<number | null> {
  const res = (await api("GET", `/api/sites?where%5Bslug%5D%5Bequals%5D=${siteSlug}&limit=1`)) as { docs: { id: number }[] };
  return res.docs[0]?.id || null;
}

async function findCategoryId(catSlug: string, siteId: number): Promise<number | null> {
  const res = (await api("GET", `/api/categories?where%5Bslug%5D%5Bequals%5D=${catSlug}&where%5Bsite%5D%5Bequals%5D=${siteId}&limit=1`)) as { docs: { id: number }[] };
  return res.docs[0]?.id || null;
}

async function findPostId(slug: string): Promise<number | null> {
  const res = (await api("GET", `/api/posts?where%5Bslug%5D%5Bequals%5D=${slug}&limit=1&depth=0`)) as { docs: { id: number }[] };
  return res.docs[0]?.id || null;
}

// --- Commands ---
async function listPosts(siteSlug: string) {
  const siteId = await findSiteId(siteSlug);
  if (!siteId) { console.error("Site not found:", siteSlug); return; }

  const res = (await api("GET", `/api/posts?where%5Bsite%5D%5Bequals%5D=${siteId}&where%5Bdraft%5D%5Bequals%5D=false&sort=-date&limit=500&depth=0`)) as {
    docs: { slug: string; title: string; date: string; score: number }[];
    totalDocs: number;
  };

  console.log(`${res.totalDocs} articles for ${siteSlug}:\n`);
  for (const doc of res.docs) {
    console.log(`  ${doc.date?.slice(0, 10) || "no date"} | ${doc.slug} | ${doc.title}`);
  }
}

async function getPost(slug: string) {
  const res = (await api("GET", `/api/posts?where%5Bslug%5D%5Bequals%5D=${slug}&limit=1`)) as { docs: unknown[] };
  if (!res.docs[0]) { console.error("Post not found:", slug); return; }
  console.log(JSON.stringify(res.docs[0], null, 2));
}

async function createPost(args: {
  site: string; title: string; slug: string; description: string;
  category?: string; html?: string; markdownFile?: string;
  tags?: string[]; draft?: boolean;
}) {
  const siteId = await findSiteId(args.site);
  if (!siteId) { console.error("Site not found:", args.site); return; }

  let content: object | undefined;
  if (args.markdownFile) {
    const md = fs.readFileSync(args.markdownFile, "utf-8");
    const html = await markdownToHtml(md);
    content = await htmlToLexical(html);
  } else if (args.html) {
    content = await htmlToLexical(args.html);
  }

  const categoryId = args.category ? await findCategoryId(args.category, siteId) : undefined;

  const data: Record<string, unknown> = {
    title: args.title,
    slug: args.slug,
    description: args.description,
    date: new Date().toISOString(),
    site: siteId,
    draft: args.draft ?? true,
    category: categoryId || undefined,
    tags: (args.tags || []).map(t => ({ tag: t })),
    content,
  };

  const result = (await api("POST", "/api/posts", data)) as { doc?: { id: number; slug: string }; errors?: { message: string }[] };
  if (result.doc) {
    console.log(`Created: ${result.doc.slug} (ID: ${result.doc.id})`);
  } else {
    console.error("Error:", result.errors?.[0]?.message || JSON.stringify(result));
  }
}

async function updatePost(args: {
  slug: string; field?: string; value?: string;
  html?: string; markdownFile?: string;
}) {
  const postId = await findPostId(args.slug);
  if (!postId) { console.error("Post not found:", args.slug); return; }

  let data: Record<string, unknown> = {};

  if (args.markdownFile) {
    const md = fs.readFileSync(args.markdownFile, "utf-8");
    const html = await markdownToHtml(md);
    data.content = await htmlToLexical(html);
  } else if (args.html) {
    data.content = await htmlToLexical(args.html);
  } else if (args.field && args.value !== undefined) {
    data[args.field] = args.value;
  }

  const result = (await api("PATCH", `/api/posts/${postId}`, data)) as { doc?: { slug: string }; errors?: { message: string }[] };
  if (result.doc) {
    console.log(`Updated: ${result.doc.slug}`);
  } else {
    console.error("Error:", result.errors?.[0]?.message || JSON.stringify(result));
  }
}

// --- CLI Parser ---
const args = process.argv.slice(2);
const command = args[0];

function getArg(name: string): string | undefined {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 ? args[idx + 1] : undefined;
}

async function main() {
  switch (command) {
    case "list":
      await listPosts(getArg("site") || "");
      break;
    case "get":
      await getPost(getArg("slug") || "");
      break;
    case "create":
      await createPost({
        site: getArg("site") || "",
        title: getArg("title") || "",
        slug: getArg("slug") || "",
        description: getArg("description") || "",
        category: getArg("category"),
        html: getArg("html"),
        markdownFile: getArg("markdown-file"),
        tags: getArg("tags")?.split(","),
        draft: getArg("draft") === "false" ? false : true,
      });
      break;
    case "update":
      await updatePost({
        slug: getArg("slug") || "",
        field: getArg("field"),
        value: getArg("value"),
        html: getArg("html"),
        markdownFile: getArg("markdown-file"),
      });
      break;
    default:
      console.log(`
Content CLI — Manage articles via Payload REST API

Commands:
  list   --site <slug>                     List articles for a site
  get    --slug <slug>                     Get full article data
  create --site <slug> --title <t> --slug <s> --description <d>
         [--category <cat>] [--html <html>] [--markdown-file <path>]
         [--tags <t1,t2>] [--draft false]
  update --slug <slug> [--field <f> --value <v>]
         [--html <html>] [--markdown-file <path>]
      `);
  }
}

main().catch(console.error);
