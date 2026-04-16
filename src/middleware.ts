import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Pfade die NICHT umgeschrieben werden sollen
const EXCLUDED_PREFIXES = [
  "/keystatic",
  "/api/",
  "/go/",
  "/admin",
  "/auth/",
  "/u/",
  "/og/",
  "/_next",
  "/images/",
  "/favicon",
];

// IndexNow Key-Datei direkt aus public/ ausliefern
const INDEXNOW_KEY_PATH = "/cb110619008442a7b52f2f3bdde45e1d.txt";

// Rewrites: /sitemap.xml → /api/sitemap, etc.
const FILE_REWRITES: Record<string, string> = {
  "/sitemap.xml": "/api/sitemap",
  "/robots.txt": "/api/robots",
  "/ai.txt": "/api/ai-txt",
};

// Regex: /img/<width>/<quality>/<path>
const IMG_PATTERN = /^\/img\/(\d+)\/(\d+)\/(.+)$/;

// Domain → Site-Slug Mapping (wird zur Build-Zeit injiziert via next.config.mjs env)
// Format: "domain1:slug1,domain2:slug2"
const DOMAIN_MAP = new Map<string, string>(
  (process.env.SITE_DOMAINS || "")
    .split(",")
    .filter(Boolean)
    .map((entry) => {
      const [domain, slug] = entry.split(":");
      return [domain, slug] as [string, string];
    })
);

// Security Headers für alle Responses
const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  // COOP: Origin-Isolation für Sicherheit (Lighthouse Best Practices)
  "Cross-Origin-Opener-Policy": "same-origin",
  // CSP: Erlaubt eigene Ressourcen, Inline-Styles/Scripts (Next.js), Google AdSense, Vercel Analytics
  "Content-Security-Policy":
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.googletagservices.com https://va.vercel-scripts.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://pagead2.googlesyndication.com https://va.vercel-scripts.com; " +
    "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com; " +
    "object-src 'none'; " +
    "base-uri 'self';",
};

const HSTS_HEADER = "max-age=63072000; includeSubDomains; preload";

function addSecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", HSTS_HEADER);
  }
  return response;
}

function getSiteSlugForHost(hostname: string): string | undefined {
  // Exakte Domain-Suche
  const direct = DOMAIN_MAP.get(hostname);
  if (direct) return direct;

  // www-Variante: www.example.de → example.de
  if (hostname.startsWith("www.")) {
    return DOMAIN_MAP.get(hostname.slice(4));
  }

  // Umgekehrt: example.de → www.example.de
  return DOMAIN_MAP.get(`www.${hostname}`);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Saubere Bild-URLs: /img/640/75/images/posts/bild.png → /_next/image?url=…&w=…&q=…
  const imgMatch = pathname.match(IMG_PATTERN);
  if (imgMatch) {
    const [, w, q, path] = imgMatch;
    const url = request.nextUrl.clone();
    url.pathname = "/_next/image";
    url.search = `?url=${encodeURIComponent("/" + path)}&w=${w}&q=${q}`;
    return addSecurityHeaders(NextResponse.rewrite(url));
  }

  // IndexNow Key-Datei direkt durchlassen (nicht umschreiben)
  if (pathname === INDEXNOW_KEY_PATH) {
    return addSecurityHeaders(NextResponse.next());
  }

  // /admin/*, /api/admin/*, /keystatic/* — Entra ID Session-Schutz in Produktion
  if (
    (pathname.startsWith("/admin") || pathname.startsWith("/api/admin") || pathname.startsWith("/keystatic")) &&
    process.env.NODE_ENV === "production"
  ) {
    // CRON_SECRET Bearer Token erlaubt (für automatisierte Calls / Cron Jobs)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
      return NextResponse.next();
    }

    // Entra ID Bearer Token erlaubt (für iOS App + API Clients)
    if (authHeader?.startsWith("Bearer ") && authHeader.length > 100) {
      // JWT has 3 parts separated by dots — basic structural check
      const token = authHeader.slice(7);
      const parts = token.split(".");
      if (parts.length === 3) {
        try {
          // Decode payload (middle part) to check issuer + expiry
          const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
          const tenantId = process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER?.match(/([a-f0-9-]{36})/)?.[1];
          const isValidIssuer = tenantId && payload.iss?.includes(tenantId);
          const isNotExpired = payload.exp && payload.exp > Date.now() / 1000;
          if (isValidIssuer && isNotExpired) {
            return NextResponse.next();
          }
        } catch {
          // Invalid JWT — fall through to session check
        }
      }
    }

    // NextAuth v5 setzt authjs.session-token Cookie (oder __Secure- Prefix in Production)
    const sessionToken =
      request.cookies.get("__Secure-authjs.session-token")?.value ||
      request.cookies.get("authjs.session-token")?.value;
    if (!sessionToken) {
      // Login-Seite und Auth-API durchlassen
      if (pathname.startsWith("/auth/") || pathname.startsWith("/api/auth/")) {
        return NextResponse.next();
      }
      // API-Endpunkte geben 401 statt Redirect
      if (pathname.startsWith("/api/")) {
        return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // Keystatic Admin: Keine restriktiven Security Headers
  // (CSP/COOP würden GitHub-API-Calls und OAuth-Popup blockieren)
  if (
    pathname.startsWith("/keystatic") ||
    pathname.startsWith("/api/keystatic")
  ) {
    return NextResponse.next();
  }

  // Ausgeschlossene Pfade nicht umschreiben
  if (EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return addSecurityHeaders(NextResponse.next());
  }

  // Hostname ohne Port
  const hostname =
    request.headers.get("host")?.split(":")[0] || "localhost";

  // --- non-www → www 301-Redirect (SEO: Canonical Domain konsolidieren) ---
  if (
    !hostname.startsWith("www.") &&
    !hostname.startsWith("localhost") &&
    !hostname.startsWith("127.0.0.1") &&
    !hostname.startsWith("192.168.") &&
    DOMAIN_MAP.has(`www.${hostname}`)
  ) {
    const url = request.nextUrl.clone();
    url.host = `www.${hostname}`;
    return NextResponse.redirect(url, 301);
  }

  // --- Domain-basiertes Routing (Produktion) ---
  const siteSlug = getSiteSlugForHost(hostname);

  // --- Lokale Entwicklung: Default-Site ---
  const defaultSite = process.env.DEFAULT_SITE;

  // SEO-Dateien auf API-Routes umleiten mit aufgelöstem Site-Slug im Pfad
  const fileRewrite = FILE_REWRITES[pathname];
  if (fileRewrite) {
    const resolvedSlug = siteSlug || defaultSite;
    if (resolvedSlug) {
      const url = request.nextUrl.clone();
      url.pathname = `${fileRewrite}/${resolvedSlug}`;
      return addSecurityHeaders(NextResponse.rewrite(url));
    }
  }

  if (siteSlug) {
    if (pathname.startsWith(`/${siteSlug}`)) {
      return addSecurityHeaders(NextResponse.next());
    }
    const url = request.nextUrl.clone();
    url.pathname = `/${siteSlug}${pathname}`;
    return addSecurityHeaders(NextResponse.rewrite(url));
  }

  if (defaultSite && pathname.startsWith(`/${defaultSite}`)) {
    return addSecurityHeaders(NextResponse.next());
  }

  if (
    (hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.")) &&
    defaultSite
  ) {
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
