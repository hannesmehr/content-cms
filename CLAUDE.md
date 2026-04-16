# CLAUDE.md – Content CMS (Payload)

## Kontext

Next.js 15 + Payload CMS 3.x Content-Platform für 6 Domains (Adsense + Affiliate, Deutsch). Migriert von Keystatic/MDX. Content liegt jetzt als Lexical Rich Text JSON in Neon PostgreSQL, Bilder auf Vercel Blob.

### Technik

| Komponente | Technologie |
|---|---|
| Framework | Next.js 15.3 App Router |
| CMS | Payload 3.83 |
| Datenbank | Neon PostgreSQL |
| Rich Text | Lexical Editor |
| Media Storage | Vercel Blob |
| Auth (Admin) | Payload Built-in (Email/Passwort) |
| Analytics | Umami (self-hosted) |
| Deployment | Vercel |

### Domains

- wohnwagenratgeber.de — Wohnwagen & Caravaning
- wochenendbeziehungen.de — Beziehungsratgeber
- immobiliensanierung.com — Sanierung & Förderung
- wohnunggesucht.com — Wohnungssuche & Mietrecht
- fahrschulbewertung.de — Führerschein & Fahrzeugkauf
- skincaretipps.de — Beauty & Skincare

## Content-Workflow

Content wird NICHT mehr als MDX-Dateien geschrieben. Stattdessen läuft alles über die REST API / `scripts/content-cli.ts`.

### CLI Commands

```bash
# Alle Artikel einer Site listen
npx tsx scripts/content-cli.ts list --site wohnwagenratgeber-de

# Artikel als Markdown exportieren (für Review/Edit)
npx tsx scripts/content-cli.ts export --slug artikel-slug

# Neuen Artikel anlegen
npx tsx scripts/content-cli.ts create \
  --site wohnwagenratgeber-de \
  --title "Artikeltitel" \
  --slug artikel-slug \
  --description "Meta-Description" \
  --category kauf-verkauf \
  --markdown-file /tmp/neuer-artikel.md \
  --tags "Tag1,Tag2" \
  --draft true

# Artikel-Content aktualisieren (aus Markdown-File)
npx tsx scripts/content-cli.ts update \
  --slug artikel-slug \
  --markdown-file /tmp/updated-article.md

# Einzelnes Feld aktualisieren
npx tsx scripts/content-cli.ts update \
  --slug artikel-slug \
  --field title \
  --value "Neuer Titel"
```

Env Vars: `PAYLOAD_EMAIL`, `PAYLOAD_PASSWORD` (oder `PAYLOAD_TOKEN`), `API_BASE` (default localhost:3002).

### Content-Format

Der CLI akzeptiert **Markdown** mit Custom-Components-Syntax. Die Konvertierung zu Lexical JSON passiert automatisch:

```markdown
# Überschrift

Normaler Text mit [Link](https://example.de).

<AffiliateBox title="Produkt XY" description="Beschreibung"
  linkUrl="https://www.amazon.de/..." linkText="Auf Amazon ansehen" />

## Tabelle

| Hersteller | Preis |
|---|---|
| Hobby | ab 20.000 € |

<InlineAd adConfig="global" />
```

## Faktencheck (`/factcheck [slug]`)

1. Artikel via CLI exportieren: `content-cli.ts export --slug X`
2. Inhalte prüfen (Preise, Modelle, Specs) gegen Web-Quellen
3. Erkenntnisse als Tabelle präsentieren (Thema | Artikel | Tatsächlich | Aktion)
4. Nach User-Freigabe: aktualisiertes Markdown speichern, via CLI update
5. `lastFactCheck` auf heutiges Datum setzen

## Title/Meta-Optimierung (`/title-only [slug]`)

1. GSC-Daten holen (`mcp__google-search-console__get_search_by_page_query`)
2. Top-Keywords für die Artikel-URL extrahieren
3. Title (max. 70 Zeichen) + Description (120-155 Zeichen) vorschlagen
4. Als Tabelle präsentieren: Alt vs. Neu mit Zeichenzahlen
5. Nach Freigabe: via CLI update
6. `lastFactCheck` auf heute setzen

## Kombiniert (`/optimize [slug]`)

Faktencheck + Title/Meta in einem Durchgang.

## Batch-Optimierung (`/optimize-batch [site] [anzahl]`)

1. GSC-Kandidaten finden (Impressionen > 20, Klicks < 5, Position < 15)
2. Priorisierung:
   - Artikel ohne `lastFactCheck` zuerst
   - Dann älteste `lastFactCheck`
   - Höchste Impressionen gewinnen bei Gleichstand
3. Max. 5 Artikel pro Durchlauf
4. Jeweils `/optimize` mit Freigabe-Warteschleife

## Regeln

- **Preise immer webrecherchieren** (Geizhals, idealo, Amazon) — nie aus dem Gedächtnis
- **Modellnamen exakt** (falsche Namen zerstören Vertrauen)
- **Zitate in Tabellen**: max. 3 Monate alte Quellen
- **Affiliate-Links** über gesamten Artikel verteilen, nicht bündeln
- **Ton beibehalten** — nur Daten ändern, nicht Schreibstil

## Technische Referenz

### Routen

- **Frontend**: `/` (Default-Site) oder `/{siteSlug}/{articleSlug}`, `/tools/{tool}`, `/kategorie/{cat}`, `/tag/{tag}`
- **Admin**: `/admin` (Payload Panel mit Custom Views: Dashboard, Media, Awin, Aktionen)
- **API**: `/api/posts`, `/api/sites`, `/api/categories`, `/api/admin/*` (Analytics, Awin, Media)
- **SEO**: `/sitemap.xml`, `/robots.txt`, `/ai.txt`

### Collections

- `sites` — Site-Config mit navItems, widgets, adSlots, Theme
- `posts` — Artikel mit Lexical content, site-Relationship, tags[], adSlots, imageUrl
- `categories` — Pro-Site Kategorien
- `pages` — Impressum, Datenschutz
- `tools` — Tool SEO-Overrides + contentAbove/contentBelow
- `ad-configs` — Global (Placeholder, AdSense, Banner, Custom HTML)
- `affiliate-links` — Global Affiliate Link Registry
- `media` — Vercel Blob Upload Collection

### Lexical Custom Blocks

- `affiliateBox` (Block) — title, description, linkUrl, linkText
- `figure` (Block) — src, alt, caption
- `inlineAd` (Block) — adConfig
- `affiliateLink` (Inline) — text, linkUrl
- `obfuscatedEmail` (Inline) — user, domain

### Scripts

```bash
# Content Management
scripts/content-cli.ts          # CRUD via REST API

# Migration (einmalig)
scripts/migrate-content.ts      # MDX → Payload Metadaten
scripts/convert-mdx-to-lexical.ts # MDX Body → Lexical JSON
scripts/migrate-images.ts       # Image-Pfade in Posts
scripts/update-site-widgets.ts  # Site Widgets + Nav
scripts/update-categories.ts    # Category Namen + Descriptions
scripts/upload-static-to-blob.ts # Hero-Bilder + Logos
scripts/upload-og-to-blob.ts    # OG-Images
scripts/seed-user.ts            # Admin-User
```

### Env Vars

```
DATABASE_URL                          # Neon PostgreSQL
PAYLOAD_SECRET                        # Verschlüsselungs-Secret
DEFAULT_SITE                          # Lokale Dev-Site
SITE_SLUGS                            # comma-separated Site-Slugs für Middleware
BLOB_BASE_URL, BLOB_READ_WRITE_TOKEN  # Vercel Blob
UMAMI_URL, UMAMI_API_USER, UMAMI_API_PASSWORD
AWIN_API_TOKEN
GSC_CLIENT_ID, GSC_CLIENT_SECRET, GSC_REFRESH_TOKEN
BING_WEBMASTER_API_KEY
KV_REST_API_URL, KV_REST_API_TOKEN    # Upstash Redis
FAL_KEY                                # fal.ai
AI_GATEWAY_API_KEY                     # Vercel AI Gateway (Claude Haiku)
```

## MCP-Server für Datenzugriff

- `mcp__google-search-console__*` — GSC Daten (Impressionen, Klicks, Queries)
- `mcp__bing-webmaster__*` — Bing Webmaster Tools
