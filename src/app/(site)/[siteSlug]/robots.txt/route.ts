import { NextResponse } from "next/server";
import { getSiteBySlug } from "@/lib/get-sites";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ siteSlug: string }> }
) {
  const { siteSlug } = await params;
  const site = await getSiteBySlug(siteSlug);
  if (!site) return new NextResponse("Not found", { status: 404 });

  const siteUrl = `https://${site.domain}`;

  const txt = `User-agent: *
Allow: /
Disallow: /keystatic
Disallow: /admin
Disallow: /go
Disallow: /impressum
Disallow: /datenschutz

Sitemap: ${siteUrl}/sitemap.xml

# AI Bots — nur Impressum/Datenschutz sperren
User-agent: GPTBot
User-agent: ChatGPT-User
User-agent: Google-Extended
User-agent: CCBot
User-agent: anthropic-ai
User-agent: ClaudeBot
User-agent: Bytespider
User-agent: cohere-ai
User-agent: Diffbot
User-agent: FacebookBot
User-agent: PerplexityBot
User-agent: Applebot-Extended
Disallow: /impressum
Disallow: /datenschutz
`;

  return new NextResponse(txt, {
    headers: { "Content-Type": "text/plain" },
  });
}
