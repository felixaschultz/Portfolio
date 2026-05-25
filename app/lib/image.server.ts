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

export type PhotoFit = "16x9" | "4x5" | "square" | "max";

export type PhotoSrcSetOptions = {
  /** @deprecated Use `fit: "16x9"` */
  crop16x9?: boolean;
  fit?: PhotoFit;
  /** Sanity image quality 1–100 (default 80). */
  quality?: number;
};

/** Cover tiles on the home page (square grid). */
export const COVER_WIDTHS_HOME_TILE = [320, 420, 560, 720] as const;

/** Photography door panel (~50vw). */
export const COVER_WIDTHS_HOME_HERO = [640, 960, 1200, 1600] as const;

/** Gallery overview cards (16:9). */
export const COVER_WIDTHS_OVERVIEW = [640, 960, 1200, 1600, 2000] as const;

/** Album prev/next nav thumbs. */
export const COVER_WIDTHS_NAV = [160, 240, 320, 480] as const;

function resolveFit(options?: PhotoSrcSetOptions): PhotoFit {
  if (options?.fit) return options.fit;
  if (options?.crop16x9) return "16x9";
  return "max";
}

function sizedBuilder(
  builder: NonNullable<ReturnType<typeof urlFor>>,
  width: number,
  options?: PhotoSrcSetOptions,
) {
  const fit = resolveFit(options);
  const quality = options?.quality ?? 80;
  let chain = builder.width(width);
  if (fit === "16x9") {
    chain = chain.height(Math.round((width * 9) / 16)).fit("crop");
  } else if (fit === "4x5") {
    chain = chain.height(Math.round((width * 5) / 4)).fit("crop");
  } else if (fit === "square") {
    chain = chain.height(width).fit("crop");
  }
  return chain.format("webp").quality(quality);
}

export function photoSrcSet(
  source: SanityImageSource,
  widths: readonly number[] | number[] = [400, 800, 1200, 1600],
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
  return builder.width(width).height(height).fit("crop").format("webp").url();
}

/** Tiny blurred placeholder for progressive loading. */
export function photoBlurPlaceholder(source: SanityImageSource, width = 48): string {
  const builder = urlFor(source);
  if (!builder) return "";
  return builder.width(width).blur(40).format("webp").url();
}
