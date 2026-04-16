/**
 * MDX → Lexical JSON Conversion Script
 *
 * Reads raw MDX content from the old content-template files,
 * converts to HTML (stripping JSX components), then uses Payload's
 * convertHTMLToLexical to get Lexical JSON. Custom components
 * (AffiliateBox, AffiliateLink, InlineAd, Figure) are inserted
 * as Lexical block/inline-block nodes.
 *
 * Usage:
 *   1. Dev server must be running on port 3002
 *   2. PAYLOAD_EMAIL=... PAYLOAD_PASSWORD=... npx tsx scripts/convert-mdx-to-lexical.ts
 *   3. Optional: --site wohnwagenratgeber-de (filter to one site)
 *   4. Optional: --slug artikel-slug (convert single article)
 *   5. Optional: --dry-run (print without saving)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { JSDOM } from "jsdom";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = process.env.API_BASE || "http://localhost:3002";
const CONTENT_ROOT = path.resolve(__dirname, "../../content-template/content");

let authToken: string | null = null;

// --- Args ---
const args = process.argv.slice(2);
const siteFilter = args.includes("--site")
  ? args[args.indexOf("--site") + 1]
  : null;
const slugFilter = args.includes("--slug")
  ? args[args.indexOf("--slug") + 1]
  : null;
const dryRun = args.includes("--dry-run");

// --- Auth ---
async function login(): Promise<string> {
  if (authToken) return authToken;
  const email = process.env.PAYLOAD_EMAIL;
  const password = process.env.PAYLOAD_PASSWORD;
  if (!email || !password) throw new Error("Set PAYLOAD_EMAIL + PAYLOAD_PASSWORD");

  const res = await fetch(`${API_BASE}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json() as { token?: string };
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

// --- MDX Parsing ---

/**
 * Extract JSX components from MDX body and replace them with markers.
 * Returns the cleaned markdown + extracted components with their positions.
 */
type ExtractedComponent = {
  marker: string;
  type: string;
  props: Record<string, string>;
  children?: string;
  isInline: boolean;
};

function extractJsxComponents(mdx: string): {
  markdown: string;
  components: ExtractedComponent[];
} {
  const components: ExtractedComponent[] = [];
  let counter = 0;

  let cleaned = mdx;

  // Pre-pass: Replace ALL AffiliateLinks inside table rows with plain markdown links.
  // Table rows start with |. Apply repeatedly until no more matches (multiple per line).
  let prevCleaned = "";
  while (prevCleaned !== cleaned) {
    prevCleaned = cleaned;
    // Self-closing in table rows
    cleaned = cleaned.replace(/^(\|[^\n]*)<AffiliateLink\s+([^>]*?)\/>/gm, (_match, before, propsStr) => {
      const props = parseJsxProps(propsStr);
      const text = props.text || "Link";
      const url = props.linkUrl || props.href || "#";
      return `${before}[${text}](${url})`;
    });
    // With children in table rows
    cleaned = cleaned.replace(/^(\|[^\n]*)<AffiliateLink\s+([^>]*?)>(.*?)<\/AffiliateLink>/gm, (_match, before, propsStr, children) => {
      const props = parseJsxProps(propsStr);
      const text = children.trim() || props.text || "Link";
      const url = props.linkUrl || props.href || "#";
      return `${before}[${text}](${url})`;
    });
  }

  // Self-closing block components: <AffiliateBox ... />, <InlineAd ... />, <Figure ... />
  cleaned = cleaned.replace(
    /<(AffiliateBox|InlineAd|Figure|ObfuscatedEmail)\s+([\s\S]*?)\/>/g,
    (_match, type, propsStr) => {
      const marker = `BLOCK_MARKER_${counter}`;
      const props = parseJsxProps(propsStr);
      const isInline = type === "ObfuscatedEmail";
      components.push({ marker, type, props, isInline });
      counter++;
      // Block components get their own paragraph line
      return isInline ? marker : `\n\n${marker}\n\n`;
    }
  );

  // AffiliateLink with children (remaining ones outside tables)
  // Keep inline — replace with markdown link (Lexical handles links natively)
  cleaned = cleaned.replace(
    /<AffiliateLink\s+([\s\S]*?)>([\s\S]*?)<\/AffiliateLink>/g,
    (_match, propsStr, children) => {
      const props = parseJsxProps(propsStr);
      const text = children.trim() || props.text || "Link";
      const url = props.linkUrl || props.href || "#";
      // Render as markdown link — Lexical converts these to link nodes
      return `[${text}](${url})`;
    }
  );

  // Self-closing AffiliateLink (remaining ones outside tables)
  cleaned = cleaned.replace(
    /<AffiliateLink\s+([\s\S]*?)\/>/g,
    (_match, propsStr) => {
      const props = parseJsxProps(propsStr);
      const text = props.text || "Link";
      const url = props.linkUrl || props.href || "#";
      return `[${text}](${url})`;
    }
  );

  return { markdown: cleaned, components };
}

function parseJsxProps(propsStr: string): Record<string, string> {
  const props: Record<string, string> = {};
  // Match key="value" or key='value'
  const regex = /(\w+)=["']([^"']*)["']/g;
  let match;
  while ((match = regex.exec(propsStr)) !== null) {
    props[match[1]] = match[2];
  }
  // Also match key={value} for simple values
  const braceRegex = /(\w+)=\{["']([^"'}]*)["']\}/g;
  while ((match = braceRegex.exec(propsStr)) !== null) {
    props[match[1]] = match[2];
  }
  return props;
}

// --- Markdown → HTML ---

async function markdownToHtml(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);

  return String(result);
}

// --- Lexical JSON builders ---

function makeTextNode(text: string, format: number = 0): object {
  return {
    type: "text",
    version: 1,
    text,
    format, // 0=normal, 1=bold, 2=italic, 3=bold+italic
    mode: "normal",
    style: "",
    detail: 0,
  };
}

function makeParagraph(children: object[]): object {
  return {
    type: "paragraph",
    version: 1,
    children,
    direction: "ltr",
    format: "",
    indent: 0,
    textFormat: 0,
    textStyle: "",
  };
}

function makeAffiliateBoxBlock(props: Record<string, string>): object {
  return {
    type: "block",
    version: 2,
    format: "",
    fields: {
      blockType: "affiliateBox",
      title: props.title || "",
      description: props.description || "",
      slug: props.slug || "",
      linkUrl: props.linkUrl || "",
      linkText: props.linkText || "",
    },
  };
}

function makeInlineAdBlock(props: Record<string, string>): object {
  return {
    type: "block",
    version: 2,
    format: "",
    fields: {
      blockType: "inlineAd",
      adConfig: props.adConfig || "global",
    },
  };
}

function makeFigureBlock(props: Record<string, string>): object {
  return {
    type: "block",
    version: 2,
    format: "",
    fields: {
      blockType: "figure",
      src: props.src || "",
      alt: props.alt || "",
      caption: props.caption || "",
    },
  };
}

function makeAffiliateLinkInline(
  props: Record<string, string>,
  children?: string
): object {
  return {
    type: "inlineBlock",
    version: 1,
    fields: {
      blockType: "affiliateLink",
      text: children || props.text || "",
      linkUrl: props.linkUrl || props.href || "",
      slug: props.slug || "",
    },
  };
}

// --- Convert HTML to Lexical using Payload's API ---

async function htmlToLexical(html: string): Promise<object | null> {
  // Use Payload's REST API to convert HTML → Lexical
  // We POST to a custom endpoint that uses convertHTMLToLexical
  // Since we can't easily call it from outside Next.js, we build
  // the Lexical JSON manually from the HTML structure

  // For now, use a simple approach: POST the HTML to an endpoint
  // that converts it. If that doesn't exist, fall back to manual parsing.

  try {
    const result = (await api("POST", "/api/admin/convert-html", { html })) as {
      lexical?: object;
    };
    if (result.lexical) return result.lexical;
  } catch {
    // Endpoint doesn't exist yet, fall back
  }

  // Manual fallback: parse HTML to basic Lexical structure
  return parseHtmlToLexicalManual(html);
}

/**
 * Simple HTML → Lexical JSON parser.
 * Handles: paragraphs, headings, links, lists, bold, italic, code, tables.
 * Not perfect but good enough for migration.
 */
function parseHtmlToLexicalManual(html: string): object {
  const dom = new JSDOM(`<div id="root">${html}</div>`);
  const root = dom.window.document.getElementById("root")!;
  const children: object[] = [];

  for (const node of Array.from(root.childNodes)) {
    const lexicalNode = convertDomNode(node as Element);
    if (lexicalNode) {
      if (Array.isArray(lexicalNode)) {
        children.push(...lexicalNode);
      } else {
        children.push(lexicalNode);
      }
    }
  }

  return {
    root: {
      type: "root",
      version: 1,
      children,
      direction: "ltr",
      format: "",
      indent: 0,
    },
  };
}

function convertDomNode(node: Node): object | object[] | null {
  if (node.nodeType === 3) {
    // Text node
    const text = node.textContent || "";
    if (!text.trim()) return null;
    return makeTextNode(text);
  }

  if (node.nodeType !== 1) return null;
  const el = node as Element;
  const tag = el.tagName?.toLowerCase();

  switch (tag) {
    case "p": {
      const children = convertChildNodes(el);
      if (children.length === 0) return null;
      return makeParagraph(children);
    }

    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6": {
      return {
        type: "heading",
        version: 1,
        tag,
        children: convertChildNodes(el),
        direction: "ltr",
        format: "",
        indent: 0,
      };
    }

    case "ul":
    case "ol": {
      const items = Array.from(el.children)
        .filter((c) => c.tagName?.toLowerCase() === "li")
        .map((li) => ({
          type: "listitem",
          version: 1,
          children: convertChildNodes(li),
          direction: "ltr",
          format: "",
          indent: 0,
          value: 1,
        }));
      return {
        type: "list",
        version: 1,
        listType: tag === "ol" ? "number" : "bullet",
        children: items,
        direction: "ltr",
        format: "",
        indent: 0,
        start: 1,
        tag,
      };
    }

    case "blockquote": {
      return {
        type: "quote",
        version: 1,
        children: convertChildNodes(el),
        direction: "ltr",
        format: "",
        indent: 0,
      };
    }

    case "table": {
      const rows: object[] = [];
      const allRows = el.querySelectorAll("tr");
      allRows.forEach((tr, rowIdx) => {
        const cells: object[] = [];
        tr.querySelectorAll("th, td").forEach((cell) => {
          cells.push({
            type: "tablecell",
            version: 1,
            children: [makeParagraph(convertChildNodes(cell))],
            colSpan: 1,
            rowSpan: 1,
            headerState: rowIdx === 0 ? 1 : 0,
          });
        });
        rows.push({
          type: "tablerow",
          version: 1,
          children: cells,
        });
      });
      return {
        type: "table",
        version: 1,
        children: rows,
      };
    }

    case "pre": {
      const code = el.querySelector("code");
      const text = code?.textContent || el.textContent || "";
      const lang = code?.className?.replace("language-", "") || "";
      return {
        type: "code",
        version: 1,
        language: lang,
        children: [makeTextNode(text)],
        direction: "ltr",
        format: "",
        indent: 0,
      };
    }

    case "hr": {
      return {
        type: "horizontalrule",
        version: 1,
      };
    }

    // Inline elements handled in convertChildNodes
    case "strong":
    case "b":
    case "em":
    case "i":
    case "code":
    case "a":
    case "sup":
      return convertInlineElement(el);

    default:
      // Unknown block element, treat as paragraph
      if (el.children?.length > 0) {
        const ch = convertChildNodes(el);
        if (ch.length > 0) return makeParagraph(ch);
      }
      return null;
  }
}

function convertChildNodes(el: Element): object[] {
  const result: object[] = [];
  for (const child of Array.from(el.childNodes)) {
    const node = convertDomNode(child);
    if (node) {
      if (Array.isArray(node)) {
        result.push(...node);
      } else {
        result.push(node);
      }
    }
  }
  return result;
}

function convertInlineElement(el: Element): object | null {
  const tag = el.tagName?.toLowerCase();

  if (tag === "a") {
    const href = el.getAttribute("href") || "";
    const children = convertChildNodes(el);
    return {
      type: "link",
      version: 3,
      children: children.length > 0 ? children : [makeTextNode(el.textContent || "")],
      direction: "ltr",
      format: "",
      indent: 0,
      fields: {
        url: href,
        linkType: href.startsWith("/") ? "internal" : "custom",
        newTab: !href.startsWith("/"),
      },
    };
  }

  const text = el.textContent || "";
  if (!text.trim()) return null;

  let format = 0;
  if (tag === "strong" || tag === "b") format = 1;
  if (tag === "em" || tag === "i") format = 2;
  if (tag === "code") {
    return makeTextNode(text, 16); // 16 = code format
  }

  return makeTextNode(text, format);
}

// --- Table HTML → Lexical Table Node ---

function htmlTableToLexicalNode(tableHtml: string): object {
  const dom = new JSDOM(`<div>${tableHtml}</div>`);
  const table = dom.window.document.querySelector("table");
  if (!table) return makeParagraph([makeTextNode("[Table conversion failed]")]);

  const rows: object[] = [];
  const allRows = table.querySelectorAll("tr");

  allRows.forEach((tr, rowIdx) => {
    const cells: object[] = [];
    tr.querySelectorAll("th, td").forEach((cell) => {
      // Parse cell content: handle bold, links, etc.
      const cellChildren: object[] = [];
      for (const child of Array.from(cell.childNodes)) {
        if (child.nodeType === 3) {
          const text = child.textContent || "";
          if (text.trim()) cellChildren.push(makeTextNode(text));
        } else if (child.nodeType === 1) {
          const el = child as Element;
          const tag = el.tagName?.toLowerCase();
          if (tag === "strong" || tag === "b") {
            cellChildren.push(makeTextNode(el.textContent || "", 1)); // bold
          } else if (tag === "em" || tag === "i") {
            cellChildren.push(makeTextNode(el.textContent || "", 2)); // italic
          } else if (tag === "a") {
            cellChildren.push({
              type: "link",
              version: 3,
              children: [makeTextNode(el.textContent || "")],
              direction: "ltr",
              format: "",
              indent: 0,
              fields: {
                url: el.getAttribute("href") || "",
                linkType: (el.getAttribute("href") || "").startsWith("/") ? "internal" : "custom",
                newTab: !(el.getAttribute("href") || "").startsWith("/"),
              },
            });
          } else {
            cellChildren.push(makeTextNode(el.textContent || ""));
          }
        }
      }

      if (cellChildren.length === 0) {
        cellChildren.push(makeTextNode(""));
      }

      cells.push({
        type: "tablecell",
        version: 1,
        children: [makeParagraph(cellChildren)],
        colSpan: 1,
        rowSpan: 1,
        headerState: rowIdx === 0 ? 1 : 0,
        backgroundColor: "",
      });
    });

    rows.push({
      type: "tablerow",
      version: 1,
      children: cells,
    });
  });

  return {
    type: "table",
    version: 1,
    children: rows,
    direction: "ltr",
    format: "",
    indent: 0,
  };
}

// --- Main conversion pipeline ---

function readMdxBody(filePath: string): string {
  const content = fs.readFileSync(filePath, "utf-8");
  const match = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  return match ? match[1].trim() : content;
}

async function convertMdxToLexical(mdxBody: string): Promise<object> {
  // Step 1: Extract JSX components
  const { markdown, components } = extractJsxComponents(mdxBody);

  // Step 2: Convert cleaned markdown to HTML
  let html = await markdownToHtml(markdown);

  // Step 2.5: Extract <table> elements (Payload converter doesn't support them)
  const extractedTables: { marker: string; tableHtml: string }[] = [];
  let tableCounter = 0;
  html = html.replace(/<table>[\s\S]*?<\/table>/g, (tableHtml) => {
    const marker = `<p>TABLE_MARKER_${tableCounter}</p>`;
    extractedTables.push({ marker: `TABLE_MARKER_${tableCounter}`, tableHtml });
    tableCounter++;
    return marker;
  });

  // Step 3: Convert HTML to Lexical JSON via Payload's converter
  const lexical = (await htmlToLexical(html)) as {
    root: { children: object[] };
  } | null;

  if (!lexical?.root?.children) {
    // Fallback: return minimal valid structure
    return { root: { type: "root", version: 1, children: [], direction: "ltr", format: "", indent: 0 } };
  }

  // Step 4: Replace BLOCK_MARKER_N paragraphs with actual Lexical block nodes
  const finalChildren: object[] = [];

  for (const child of lexical.root.children) {
    // Check if this paragraph contains a block marker
    const firstChild = (child as { children?: { text?: string }[] }).children?.[0];
    const text = firstChild?.text || "";
    const markerMatch = text.match(/^BLOCK_MARKER_(\d+)$/);

    if (markerMatch) {
      const idx = parseInt(markerMatch[1]);
      const comp = components[idx];
      if (comp && !comp.isInline) {
        switch (comp.type) {
          case "AffiliateBox":
            finalChildren.push(makeAffiliateBoxBlock(comp.props));
            break;
          case "InlineAd":
            finalChildren.push(makeInlineAdBlock(comp.props));
            break;
          case "Figure":
            finalChildren.push(makeFigureBlock(comp.props));
            break;
          default:
            finalChildren.push(child); // Unknown type, keep as paragraph
        }
      } else {
        finalChildren.push(child); // Inline component or not found
      }
    } else {
      finalChildren.push(child);
    }
  }

  // Step 5: Replace table markers with Lexical table nodes
  const withTables: object[] = [];
  for (const child of finalChildren) {
    const childStr = JSON.stringify(child);
    let isTable = false;
    for (const table of extractedTables) {
      if (childStr.includes(table.marker)) {
        withTables.push(htmlTableToLexicalNode(table.tableHtml));
        isTable = true;
        break;
      }
    }
    if (!isTable) {
      withTables.push(child);
    }
  }

  return {
    root: {
      ...lexical.root,
      children: withTables,
    },
  };
}

function replaceMarkerInChildren(
  children: object[],
  marker: string,
  replacement: object
): boolean {
  for (let i = 0; i < children.length; i++) {
    const child = children[i] as { type?: string; text?: string; children?: object[] };
    if (child.type === "text" && child.text?.includes(marker)) {
      // Split text around marker
      const parts = child.text.split(marker);
      const newNodes: object[] = [];
      for (let j = 0; j < parts.length; j++) {
        if (parts[j]) newNodes.push(makeTextNode(parts[j]));
        if (j < parts.length - 1) newNodes.push(replacement);
      }
      children.splice(i, 1, ...newNodes);
      return true;
    }
    if (child.children && replaceMarkerInChildren(child.children, marker, replacement)) {
      return true;
    }
  }
  return false;
}

// --- Main ---

async function main() {
  console.log("MDX → Lexical Conversion");
  console.log(`API: ${API_BASE}`);
  if (siteFilter) console.log(`Site filter: ${siteFilter}`);
  if (slugFilter) console.log(`Slug filter: ${slugFilter}`);
  if (dryRun) console.log("DRY RUN mode");

  const sitesDir = path.join(CONTENT_ROOT, "sites");
  const siteDirs = fs
    .readdirSync(sitesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((s) => !siteFilter || s === siteFilter);

  let converted = 0;
  let failed = 0;

  for (const siteSlug of siteDirs) {
    const postsDir = path.join(sitesDir, siteSlug, "posts");
    if (!fs.existsSync(postsDir)) continue;

    const posts = fs
      .readdirSync(postsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .filter((d) => !slugFilter || d.name === slugFilter);

    console.log(`\n--- ${siteSlug}: ${posts.length} posts ---`);

    for (const post of posts) {
      const mdxPath = path.join(postsDir, post.name, "index.mdx");
      if (!fs.existsSync(mdxPath)) continue;

      try {
        const mdxBody = readMdxBody(mdxPath);
        const lexicalJson = await convertMdxToLexical(mdxBody);

        if (dryRun) {
          console.log(`  [dry] ${post.name}: ${JSON.stringify(lexicalJson).length} bytes`);
          converted++;
          continue;
        }

        // Find the post ID by slug + site
        const searchResult = (await api(
          "GET",
          `/api/posts?where[slug][equals]=${post.name}&limit=1`
        )) as { docs: { id: string }[] };

        const postId = searchResult.docs?.[0]?.id;
        if (!postId) {
          console.log(`  ✗ ${post.name}: not found in DB`);
          failed++;
          continue;
        }

        // Update the post with Lexical content
        const patchResult = await api("PATCH", `/api/posts/${postId}`, {
          content: lexicalJson,
        }) as { doc?: { content?: unknown }; errors?: { message: string }[] };

        if (patchResult.errors?.length) {
          // Retry without tables — strip table nodes and try again
          const noTables = {
            root: {
              ...(lexicalJson as { root: { children: object[] } }).root,
              children: (lexicalJson as { root: { children: object[] } }).root.children
                .filter((n: { type?: string }) => n.type !== "table"),
            },
          };
          const retryResult = await api("PATCH", `/api/posts/${postId}`, {
            content: noTables,
          }) as { doc?: { content?: unknown }; errors?: { message: string }[] };

          if (retryResult.doc?.content) {
            console.log(`  ⚠ ${post.name}: saved WITHOUT tables (table validation failed)`);
            converted++;
            continue;
          }

          console.log(`  ✗ ${post.name}: PATCH error even without tables: ${retryResult.errors?.[0]?.message || patchResult.errors[0].message}`);
          failed++;
          continue;
        }

        // Verify content was saved
        const savedContent = patchResult.doc?.content;
        if (!savedContent) {
          console.log(`  ⚠ ${post.name}: Content null after PATCH (validation failed?)`);
          // Dump first 500 chars of what we tried to save
          if (converted < 3) {
            const rootChildren = (lexicalJson as { root?: { children?: unknown[] } }).root?.children;
            console.log(`    Attempted ${rootChildren?.length || 0} root children, first type: ${(rootChildren?.[0] as { type?: string })?.type}`);
          }
          failed++;
          continue;
        }

        converted++;
        if (converted % 20 === 0) console.log(`  ... ${converted} converted`);
      } catch (err) {
        console.log(`  ✗ ${post.name}: ${(err as Error).message}`);
        failed++;
      }
    }
  }

  console.log(`\n=== Done: ${converted} converted, ${failed} failed ===`);
}

main().catch((err) => {
  console.error("Conversion failed:", err);
  process.exit(1);
});
