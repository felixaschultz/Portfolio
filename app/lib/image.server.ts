import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { getSanityClient } from "./sanity.server";

export function urlFor(source: SanityImageSource) {
  const client = getSanityClient();
  if (!client) return null;
  return createImageUrlBuilder(client).image(source);
}

export function photoSrcSet(
  source: SanityImageSource,
  widths = [400, 800, 1200, 1600],
): { src: string; srcSet: string } {
  const builder = urlFor(source);
  if (!builder) return { src: "", srcSet: "" };
  const src = builder.width(1200).auto("format").url();
  const srcSet = widths
    .map((w) => `${builder.width(w).auto("format").url()} ${w}w`)
    .join(", ");
  return { src, srcSet };
}
