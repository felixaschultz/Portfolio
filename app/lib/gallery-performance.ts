/** Grid thumbnails above this count use smaller Sanity widths. */
export const LARGE_GALLERY_THRESHOLD = 32;

/** Beyond this count, stream photos in batches while scrolling. */
export const PROGRESSIVE_GALLERY_THRESHOLD = 56;

export const INITIAL_GALLERY_BATCH = 40;
export const GALLERY_BATCH_SIZE = 28;

/** Skip per-tile reveal animations above this (many IntersectionObservers). */
export const REVEAL_DISABLE_THRESHOLD = 28;

export const GRID_SRC_WIDTHS = [480, 720, 1080, 1440];
export const GRID_SRC_WIDTHS_LARGE = [360, 540, 720, 960, 1200];
export const LIGHTBOX_SRC_WIDTHS = [1200, 1800, 2400, 3200];

export function isLargeGallery(imageCount: number): boolean {
  return imageCount > LARGE_GALLERY_THRESHOLD;
}

export function needsProgressiveLoading(imageCount: number): boolean {
  return imageCount > PROGRESSIVE_GALLERY_THRESHOLD;
}

export function shouldDisableReveal(imageCount: number): boolean {
  return imageCount > REVEAL_DISABLE_THRESHOLD;
}

export function gridSrcWidths(imageCount: number): number[] {
  return isLargeGallery(imageCount) ? GRID_SRC_WIDTHS_LARGE : GRID_SRC_WIDTHS;
}
