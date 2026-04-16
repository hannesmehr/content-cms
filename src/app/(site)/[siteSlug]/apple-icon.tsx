import { ImageResponse } from "next/og";
import { getSiteBySlug, getThemeColors } from "@/lib/get-sites";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

async function getCustomFavicon(siteSlug: string): Promise<string | null> {
  const blobBase = process.env.BLOB_BASE_URL;
  if (!blobBase) return null;
  try {
    const url = `${blobBase}/images/sites/${siteSlug}/favicon.svg`;
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export default async function AppleIcon({
  params,
}: {
  params: Promise<{ siteSlug: string }>;
}) {
  const { siteSlug } = await params;
  const site = await getSiteBySlug(siteSlug);
  const theme = getThemeColors(site?.themePreset || "blue");

  const customSvg = await getCustomFavicon(siteSlug);

  if (customSvg) {
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
            borderRadius: "32px",
            background: "white",
          }}
        >
          <img src={encoded} width={140} height={140} />
        </div>
      ),
      { ...size }
    );
  }

  // Fallback: Buchstabe mit Theme-Gradient
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
          borderRadius: "32px",
          background: `linear-gradient(135deg, ${theme.primary[600]}, ${theme.primary[700]})`,
          color: "#ffffff",
          fontSize: "100px",
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
