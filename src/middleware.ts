import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Pfade die NICHT umgeschrieben werden sollen
const EXCLUDED_PREFIXES = [
  "/admin",       // Payload Admin Panel
  "/api/",        // All API routes (Payload + custom)
  "/go/",         // Affiliate redirects
  "/u/",          // Umami proxy
  "/og/",         // OG images
  "/_next",       // Next.js internals
  "/images/",     // Static images
  "/favicon",     // Favicon
  "/media/",      // Vercel Blob media
];

// Rewrites: /sitemap.xml → /api/sitemap, etc.
const FILE_REWRITES: Record<string, string> = {
  "/sitemap.xml": "/api/sitemap",
  "/robots.txt": "/api/robots",
  "/ai.txt": "/api/ai-txt",
};

// Regex: /img/<width>/<quality>/<path>
const IMG_PATTERN = /^\/img\/(\d+)\/(\d+)\/(.+)$/;

// Domain → Site-Slug Mapping
const DOMAIN_MAP = new Map<string, string>(
  (process.env.SITE_DOMAINS || "")
    .split(",")
    .filter(Boolean)
    .map((entry) => {
      const [domain, slug] = entry.split(":");
      return [domain, slug] as [string, string];
    })
);

// Security Headers
const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

function addSecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

function getSiteSlugForHost(hostname: string): string | undefined {
  const direct = DOMAIN_MAP.get(hostname);
  if (direct) return direct;
  if (hostname.startsWith("www.")) {
    return DOMAIN_MAP.get(hostname.slice(4));
  }
  return DOMAIN_MAP.get(`www.${hostname}`);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Image optimization: /img/640/75/images/posts/bild.png → /_next/image
  const imgMatch = pathname.match(IMG_PATTERN);
  if (imgMatch) {
    const [, w, q, path] = imgMatch;
    const url = request.nextUrl.clone();
    url.pathname = "/_next/image";
    url.search = `?url=${encodeURIComponent("/" + path)}&w=${w}&q=${q}`;
    return addSecurityHeaders(NextResponse.rewrite(url));
  }

  // Excluded paths: don't rewrite, just pass through
  if (EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return addSecurityHeaders(NextResponse.next());
  }

  // Hostname without port
  const hostname =
    request.headers.get("host")?.split(":")[0] || "localhost";

  // --- Domain-based routing (Production) ---
  const siteSlug = getSiteSlugForHost(hostname);

  // --- Local dev: Default site ---
  const defaultSite = process.env.DEFAULT_SITE;

  // SEO files → API routes
  const fileRewrite = FILE_REWRITES[pathname];
  if (fileRewrite) {
    const resolvedSlug = siteSlug || defaultSite;
    if (resolvedSlug) {
      const url = request.nextUrl.clone();
      url.pathname = `${fileRewrite}/${resolvedSlug}`;
      return addSecurityHeaders(NextResponse.rewrite(url));
    }
  }

  // Production: domain → /{siteSlug}/path
  if (siteSlug) {
    if (pathname.startsWith(`/${siteSlug}`)) {
      return addSecurityHeaders(NextResponse.next());
    }
    const url = request.nextUrl.clone();
    url.pathname = `/${siteSlug}${pathname}`;
    return addSecurityHeaders(NextResponse.rewrite(url));
  }

  // Local dev: rewrite to /{defaultSite}/path
  if (
    (hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.")) &&
    defaultSite
  ) {
    if (pathname.startsWith(`/${defaultSite}`)) {
      return addSecurityHeaders(NextResponse.next());
    }
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultSite}${pathname}`;
    return addSecurityHeaders(NextResponse.rewrite(url));
  }

  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|media/).*)",
    "/img/:path*",
  ],
};
