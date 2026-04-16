import { NextResponse } from "next/server";
import { getAwinSummary } from "@/lib/awin";

export const dynamic = "force-dynamic";

// GET /api/admin/awin?days=30
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30", 10);

  try {
    const summary = await getAwinSummary(Math.min(days, 31)); // API max 31 days
    if (!summary) {
      return NextResponse.json({ error: "Awin API not configured or unavailable" }, { status: 503 });
    }
    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Awin API error" },
      { status: 500 }
    );
  }
}
