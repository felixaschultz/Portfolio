import type { TFunction } from "i18next";
import type { Locale } from "./i18n";
import { formatGalleryDate } from "./format-gallery-date";

type GalleryMetaSource = {
  takenAt?: string;
  location?: string;
  imageCount: number;
};

/** Stable album meta line for SSR + hydration (format in the route loader). */
export function buildGalleryAlbumMetaLine(
  gallery: GalleryMetaSource,
  locale: Locale,
  t: TFunction,
): string {
  const parts = [
    formatGalleryDate(gallery.takenAt, locale),
    gallery.location,
    t("photography.photoCount", { count: gallery.imageCount }),
  ].filter(Boolean);
  return parts.join(" · ");
}
