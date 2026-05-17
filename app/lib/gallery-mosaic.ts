import type { CSSProperties } from "react";

const DEFAULT_SIZE = { width: 1600, height: 1067 };

export type MosaicImage = { width?: number; height?: number };

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (Math.imul(31, hash) + value.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

function seededRandom(seed: number): () => number {
  let state = seed || 1;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithRng<T>(items: T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Light shuffle so layouts vary per gallery but stay stable on refresh. */
export function shuffleGalleryImages<T extends MosaicImage>(images: T[], seed: string): T[] {
  if (images.length < 2) return images;
  const rng = seededRandom(hashString(seed));
  return shuffleWithRng(images, rng);
}

/**
 * Split image indices across columns by always adding to the shortest column
 * (balances heights so landscapes stack under portraits with no holes).
 */
export function buildMasonryColumns(
  images: MosaicImage[],
  columnCount: number,
  seed: string,
): number[][] {
  if (images.length === 0) return [];
  const cols = Math.max(1, columnCount);
  const rng = seededRandom(hashString(`${seed}:${cols}`));
  const heights = new Array<number>(cols).fill(0);
  const buckets: number[][] = Array.from({ length: cols }, () => []);

  images.forEach((img, index) => {
    const w = Math.max(img.width ?? DEFAULT_SIZE.width, 1);
    const h = Math.max(img.height ?? DEFAULT_SIZE.height, 1);
    const unitHeight = h / w;

    const ranked = heights
      .map((height, col) => ({ col, height }))
      .sort((a, b) => a.height - b.height);

    let pick = ranked[0]?.col ?? 0;
    if (ranked.length > 1 && rng() < 0.22) {
      pick = ranked[1].col;
    }

    buckets[pick].push(index);
    heights[pick] += unitHeight;
  });

  return buckets;
}

export function mosaicItemStyle(): CSSProperties {
  return {};
}

export type MosaicLayout = {
  desktop: number[][];
  tablet: number[][];
};

/** @deprecated Use buildMasonryColumns */
export function packMosaicImages(images: MosaicImage[], seed = "mosaic"): MosaicLayout {
  return {
    desktop: buildMasonryColumns(images, 3, seed),
    tablet: buildMasonryColumns(images, 2, `${seed}-tablet`),
  };
}
