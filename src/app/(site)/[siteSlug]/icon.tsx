import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import path from "path";
import { getSiteBySlug, getThemeColors } from "@/lib/get-sites";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

async function getCustomFavicon(siteSlug: string): Promise<string | null> {
  try {
    const svgPath = path.join(
      process.cwd(),
      "public",
      "images",
      "sites",
      siteSlug,
      "favicon.svg"
    );
    const svg = await readFile(svgPath, "utf-8");
    return svg;
  } catch {
    return null;
  }
}

export default async function Icon({
  params,
}: {
  params: Promise<{ siteSlug: string }>;
}) {
  const { siteSlug } = await params;
  const site = await getSiteBySlug(siteSlug);
  const theme = getThemeColors(site?.themePreset || "blue");

  const customSvg = await getCustomFavicon(siteSlug);

  if (customSvg) {
    // Encode SVG as data URI for img tag in ImageResponse
    const encoded = `data:image/svg+xml;base64,${Buffer.from(customSvg).toString("base64")}`;
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img src={encoded} width={32} height={32} />
        </div>
      ),
      { ...size }
    );
  }

  // Fallback: Buchstabe mit Theme-Farbe
  const initial = site?.name?.charAt(0)?.toUpperCase() || "C";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "6px",
          background: theme.primary[600],
          color: "#ffffff",
          fontSize: "20px",
          fontWeight: 700,
          fontFamily: "sans-serif",
        }}
      >
        {initial}
      </div>
    ),
    { ...size }
  );
}
