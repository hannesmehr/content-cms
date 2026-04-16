import NextImage from "next/image";
import type { ImageProps } from "next/image";

/**
 * Drop-in Ersatz für next/image mit sauberen URLs.
 *
 * Der Loader ist global in next.config.mjs konfiguriert (loaderFile).
 * Statt: /_next/image?url=%2Fimages%2F…&w=96&q=75
 * Wird:  /img/96/75/images/…/bild.png
 */
export function Image(props: ImageProps) {
  return <NextImage {...props} />;
}
