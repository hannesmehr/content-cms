/**
 * Update category names and descriptions from old YAML files.
 *
 * Usage: PAYLOAD_EMAIL=... PAYLOAD_PASSWORD=... npx tsx scripts/update-categories.ts
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
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function main() {
  const sitesDir = path.join(CONTENT_ROOT, "sites");
  const siteDirs = fs.readdirSync(sitesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory()).map((d) => d.name);

  let updated = 0;

  for (const siteSlug of siteDirs) {
    const siteRes = (await api("GET", `/api/sites?where%5Bslug%5D%5Bequals%5D=${siteSlug}&limit=1&depth=0`)) as { docs: { id: number }[] };
    const siteId = siteRes.docs?.[0]?.id;
    if (!siteId) continue;

    const catDir = path.join(sitesDir, siteSlug, "categories");
    if (!fs.existsSync(catDir)) continue;

    const cats = fs.readdirSync(catDir, { withFileTypes: true })
      .filter((d) => d.isDirectory());

    for (const cat of cats) {
      const yamlPath = path.join(catDir, cat.name, "index.yaml");
      if (!fs.existsSync(yamlPath)) continue;
      const data = yaml.parse(fs.readFileSync(yamlPath, "utf-8"));

      // Find category by slug + site
      const catRes = (await api("GET",
        `/api/categories?where%5Band%5D%5B0%5D%5Bslug%5D%5Bequals%5D=${cat.name}&where%5Band%5D%5B1%5D%5Bsite%5D%5Bequals%5D=${siteId}&limit=1&depth=0`
      )) as { docs: { id: number }[] };

      const catId = catRes.docs?.[0]?.id;
      if (!catId) {
        console.log(`✗ ${siteSlug}/${cat.name}: not found`);
        continue;
      }

      const result = (await api("PATCH", `/api/categories/${catId}`, {
        name: data.name || cat.name,
        description: data.description || "",
      })) as { doc?: unknown; errors?: { message: string }[] };

      if (result.doc) {
        console.log(`✓ ${siteSlug}/${cat.name}: ${data.name}`);
        updated++;
      } else {
        console.log(`✗ ${siteSlug}/${cat.name}: ${result.errors?.[0]?.message}`);
      }
    }
  }

  console.log(`\n=== Done: ${updated} categories updated ===`);
}

main().catch(console.error);
