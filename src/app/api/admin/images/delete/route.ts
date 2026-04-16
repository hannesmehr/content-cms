import { NextResponse } from "next/server";
import { deleteImage, getActiveImageId } from "@/lib/image-gen";

export const dynamic = "force-dynamic";

// POST /api/admin/images/delete
// Body: { imageId, siteSlug, articleSlug }
export async function POST(request: Request) {
  try {
    const { imageId, siteSlug, articleSlug } = await request.json();

    if (!imageId) {
      return NextResponse.json({ error: "imageId required" }, { status: 400 });
    }

    // Check if this is the active image for the article
    if (siteSlug && articleSlug) {
      const activeId = await getActiveImageId(siteSlug, articleSlug);
      if (activeId === imageId) {
        return NextResponse.json(
          { error: "Kann nicht gelöscht werden – dieses Bild ist das aktive Artikelbild. Generiere zuerst ein neues Bild." },
          { status: 409 }
        );
      }
    }

    const deleted = await deleteImage(imageId);

    if (!deleted) {
      return NextResponse.json({ error: "Bild nicht gefunden" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, deleted: imageId });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unbekannter Fehler" },
      { status: 500 }
    );
  }
}
