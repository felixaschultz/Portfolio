import type { GalleryListItem } from "./galleries";

export function parseGalleryYear(takenAt?: string): number | null {
  if (!takenAt) return null;
  const date = new Date(takenAt.includes("T") ? takenAt : `${takenAt}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.getUTCFullYear();
}

export type GalleryListEntry =
  | { kind: "gallery"; gallery: GalleryListItem; index: number }
  | { kind: "year"; year: number };

/**
 * Inserts a year label before the first gallery of each calendar year older than `currentYear`.
 * Galleries from the current year (and undated) have no divider — newest work reads as “now”.
 */
export function buildGalleryListEntries(
  galleries: GalleryListItem[],
  currentYear = new Date().getFullYear(),
): GalleryListEntry[] {
  const entries: GalleryListEntry[] = [];
  let lastYearDivider: number | null = null;
  let index = 0;

  for (const gallery of galleries) {
    const year = parseGalleryYear(gallery.takenAt);

    if (year !== null && year < currentYear && year !== lastYearDivider) {
      entries.push({ kind: "year", year });
      lastYearDivider = year;
    }

    entries.push({ kind: "gallery", gallery, index });
    index += 1;
  }

  return entries;
}
