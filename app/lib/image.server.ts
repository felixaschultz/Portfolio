import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { getSanityClient } from "./sanity.server";

export function hasValidImageAsset(source: SanityImageSource | null | undefined): boolean {
  if (!source || typeof source !== "object") return false;
  const ref = (source as { asset?: { _ref?: string } }).asset?._ref;
  return typeof ref === "string" && ref.length > 0;
}

/** Strip GROQ metadata (e.g. dimensions) before passing to @sanity/image-url. */
export function toSanityImageSource(image: SanityImageSource): SanityImageSource {
  if (!image || typeof image !== "object" || Array.isArray(image)) return image;
  const record = image as Record<string, unknown>;
  const { dimensions: _dimensions, ...source } = record;
  return source as SanityImageSource;
}

export function urlFor(source: SanityImageSource) {
  if (!hasValidImageAsset(source)) return null;
  const client = getSanityClient();
  if (!client) return null;
  return createImageUrlBuilder(client).image(source);
}

type PhotoSrcSetOptions = {
  /** Center-crop to 16:9 (covers). */
  crop16x9?: boolean;
};

function sizedBuilder(
  builder: NonNullable<ReturnType<typeof urlFor>>,
  width: number,
  options?: PhotoSrcSetOptions,
) {
  let chain = builder.width(width);
  if (options?.crop16x9) {
    chain = chain.height(Math.round((width * 9) / 16)).fit("crop");
  }
  return chain.auto("format");
}

export function photoSrcSet(
  source: SanityImageSource,
  widths = [400, 800, 1200, 1600],
  options?: PhotoSrcSetOptions,
): { src: string; srcSet: string } {
  const builder = urlFor(source);
  if (!builder) return { src: "", srcSet: "" };
  const maxWidth = widths[widths.length - 1] ?? 1200;
  const src = sizedBuilder(builder, maxWidth, options).url();
  const srcSet = widths
    .map((w) => `${sizedBuilder(builder, w, options).url()} ${w}w`)
    .join(", ");
  return { src, srcSet };
}

/** Open Graph / social preview (1.91:1). */
export function photoOgImage(source: SanityImageSource, width = 1200, height = 630): string {
  const builder = urlFor(source);
  if (!builder) return "";
  return builder.width(width).height(height).fit("crop").auto("format").url();
}

/** Tiny blurred placeholder for progressive loading. */
export function photoBlurPlaceholder(source: SanityImageSource, width = 48): string {
  const builder = urlFor(source);
  if (!builder) return "";
  return builder.width(width).blur(40).auto("format").url();
}
