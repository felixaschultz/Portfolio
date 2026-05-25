import type { SanityImageSource } from "@sanity/image-url";

/** Sanity-compatible hotspot used for home favorite card crops (4:5). */
export type HomeFavoriteFraming = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const DEFAULT_HOME_FAVORITE_FRAMING: HomeFavoriteFraming = {
  x: 0.5,
  y: 0.5,
  width: 0.85,
  height: 0.85,
};

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function normalizeHomeFavoriteFraming(
  raw?: Partial<HomeFavoriteFraming> | null,
): HomeFavoriteFraming | null {
  if (!raw || typeof raw !== "object") return null;
  const { x, y, width, height } = raw;
  if (
    typeof x !== "number" ||
    typeof y !== "number" ||
    typeof width !== "number" ||
    typeof height !== "number"
  ) {
    return null;
  }
  return {
    x: clamp01(x),
    y: clamp01(y),
    width: clamp01(width),
    height: clamp01(height),
  };
}

export function framingFromGalleryHotspot(
  image?: { hotspot?: Partial<HomeFavoriteFraming> } | null,
): HomeFavoriteFraming {
  const hotspot = image?.hotspot;
  const normalized = normalizeHomeFavoriteFraming(hotspot);
  return normalized ?? DEFAULT_HOME_FAVORITE_FRAMING;
}

export function framingFromImageSource(
  source?: SanityImageSource | null,
): HomeFavoriteFraming {
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return DEFAULT_HOME_FAVORITE_FRAMING;
  }
  return framingFromGalleryHotspot(source as { hotspot?: Partial<HomeFavoriteFraming> });
}

export function applyHomeFavoriteFraming(
  source: SanityImageSource,
  framing?: Partial<HomeFavoriteFraming> | null,
): SanityImageSource {
  const normalized = normalizeHomeFavoriteFraming(framing);
  if (!normalized) return source;
  if (!source || typeof source !== "object" || Array.isArray(source)) return source;
  return {
    ...(source as Record<string, unknown>),
    hotspot: normalized,
  } as SanityImageSource;
}
