/**
 * Update site widgets and navItems from old YAML configs.
 * Translates Keystatic's discriminant/value format to Payload's flat format.
 *
 * Usage: PAYLOAD_EMAIL=... PAYLOAD_PASSWORD=... npx tsx scripts/update-site-widgets.ts
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

// Convert Keystatic navItems (discriminant/value) to Payload format
function convertNavItems(keystatic: unknown[]): unknown[] {
  if (!Array.isArray(keystatic)) return [];
  return keystatic.map((item: unknown) => {
    const nav = item as { discriminant: string; value: Record<string, string> };
    const type = nav.discriminant;
    const val = nav.value || {};

    switch (type) {
      case "startseite":
        return { type: "startseite", label: val.label || "Startseite", href: "/" };
      case "kategorie":
        return {
          type: "kategorie",
          label: val.labelOverride || val.category || "",
          href: `/kategorie/${val.category}`,
          category: val.category,
        };
      case "tag":
        return {
          type: "tag",
          label: val.labelOverride || val.tag || "",
          href: `/tag/${val.tag}`,
          tag: val.tag,
        };
      case "link":
        return { type: "link", label: val.label || "", href: val.href || "" };
      default:
        return { type: "link", label: "Unknown", href: "/" };
    }
  });
}

// Convert Keystatic widgets to Payload format (mostly pass-through)
function convertWidgets(keystatic: unknown[]): unknown[] {
  if (!Array.isArray(keystatic)) return [];
  return keystatic.map((w: unknown) => {
    const widget = w as Record<string, unknown>;
    return {
      type: widget.type || "featured",
      count: widget.count || 6,
      title: widget.title || "",
      showDescription: widget.showDescription ?? false,
      descriptionLines: widget.descriptionLines || 1,
      heroStyle: widget.heroStyle || "minimal",
      heroSubline: widget.heroSubline || "",
      heroImageUrl: widget.heroImage ? `/media${widget.heroImage}` : "",
      heroImageAlt: widget.heroImageAlt || "",
      heroCtaText: widget.heroCtaText || "",
      heroCtaLink: widget.heroCtaLink || "",
    };
  });
}

async function main() {
  const sitesDir = path.join(CONTENT_ROOT, "sites");
  const siteDirs = fs.readdirSync(sitesDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const siteSlug of siteDirs) {
    const yamlPath = path.join(sitesDir, siteSlug, "index.yaml");
    if (!fs.existsSync(yamlPath)) continue;

    const data = yaml.parse(fs.readFileSync(yamlPath, "utf-8"));

    const navItems = convertNavItems(data.navItems || []);
    const widgets = convertWidgets(data.widgets || []);

    // Find site ID
    const searchResult = (await api(
      "GET",
      `/api/sites?where%5Bslug%5D%5Bequals%5D=${siteSlug}&limit=1`
    )) as { docs: { id: number }[] };

    const siteId = searchResult.docs?.[0]?.id;
    if (!siteId) {
      console.log(`✗ ${siteSlug}: not found`);
      continue;
    }

    // Update site
    const result = (await api("PATCH", `/api/sites/${siteId}`, {
      navItems,
      widgets,
    })) as { doc?: { id: number } };

    if (result.doc) {
      console.log(`✓ ${siteSlug}: ${navItems.length} navItems, ${widgets.length} widgets`);
    } else {
      console.log(`✗ ${siteSlug}: update failed`, JSON.stringify(result).slice(0, 100));
    }
  }
}

main().catch(console.error);
