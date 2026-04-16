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

  const txt = `# ai.txt – ${site.name}
# https://${site.domain}/ai.txt
#
# Dieses Dokument regelt die Nutzung der Inhalte durch KI-Systeme.

User-Agent: *
Disallow: /impressum
Disallow: /datenschutz

# Impressum und Datenschutz dürfen nicht für KI-Training genutzt werden.
# Alle anderen Inhalte dürfen gecrawlt und indexiert werden.
#
# Legal pages (imprint, privacy) must not be used for AI training.
# All other content may be crawled and indexed.
`;

  return new NextResponse(txt, {
    headers: { "Content-Type": "text/plain" },
  });
}
