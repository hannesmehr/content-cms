/**
 * Custom Image Loader für saubere Bild-URLs.
 *
 * Erzeugt:  /img/<width>/<quality>/<pfad>
 * Statt:    /_next/image?url=…&w=…&q=…
 *
 * Der Rewrite in next.config.mjs leitet intern an /_next/image weiter,
 * welches die eigentliche Bildoptimierung übernimmt.
 */
export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // SVGs brauchen keine Optimierung – direkt ausliefern
  if (src.endsWith(".svg")) {
    return src;
  }
  // Blob-Bilder: direkt die Blob-URL nutzen (bereits optimierte WebPs)
  if (src.startsWith("/media/")) {
    return src;
  }
  const q = quality || 75;
  const cleanSrc = src.startsWith("/") ? src.slice(1) : src;
  return `/img/${width}/${q}/${cleanSrc}`;
}
