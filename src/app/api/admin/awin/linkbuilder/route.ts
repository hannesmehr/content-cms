import { NextResponse } from "next/server";
import { generateDeepLink, buildDeepLinkManual, getJoinedProgrammes } from "@/lib/awin";

export const dynamic = "force-dynamic";

// POST /api/admin/awin/linkbuilder
// Body: { advertiserId, destinationUrl, clickref?, shorten? }
export async function POST(request: Request) {
  try {
    const { advertiserId, destinationUrl, clickref, shorten } = await request.json();

    if (!advertiserId || !destinationUrl) {
      return NextResponse.json({ error: "advertiserId and destinationUrl required" }, { status: 400 });
    }

    // Try API first
    const apiResult = await generateDeepLink(advertiserId, destinationUrl, { clickref, shorten });

    if (apiResult?.url) {
      return NextResponse.json({
        url: apiResult.url,
        shortUrl: apiResult.shortUrl,
        method: "api",
      });
    }

    // Fallback to manual construction
    const manualUrl = buildDeepLinkManual(advertiserId, destinationUrl, clickref);
    return NextResponse.json({
      url: manualUrl,
      method: "manual",
      note: "API-Generierung fehlgeschlagen, manueller Deeplink erstellt",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Link Builder error" },
      { status: 500 }
    );
  }
}

// GET /api/admin/awin/linkbuilder — returns available advertisers
export async function GET() {
  const programmes = await getJoinedProgrammes();
  return NextResponse.json({ programmes: programmes || [] });
}
