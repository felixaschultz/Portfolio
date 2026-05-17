import type { GalleryDetail } from "./galleries";
import { formatGalleryDate } from "./format-gallery-date";
import { localizedField, type Locale } from "./i18n";
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH, buildPageMeta } from "./seo";
import { seoCopy } from "./seo-copy";

/** Meta description for a gallery — localized copy, then location/date context. */
export function galleryMetaDescription(gallery: GalleryDetail, locale: Locale): string {
  const description = localizedField(gallery.description, locale)?.trim();
  if (description) return description.slice(0, 300);

  const dateLabel = formatGalleryDate(gallery.takenAt, locale);
  const parts = [gallery.location, dateLabel].filter(Boolean);
  if (parts.length > 0) return parts.join(" · ").slice(0, 300);

  return seoCopy(locale, "photographyDescription");
}

/** Per-gallery document + Open Graph / Twitter meta. */
export function buildGalleryPageMeta(gallery: GalleryDetail, locale: Locale) {
  const title = localizedField(gallery.title, locale) || seoCopy(locale, "photographyTitle");
  const description = galleryMetaDescription(gallery, locale);
  const image = gallery.coverOgUrl || gallery.coverUrl || gallery.images[0]?.imageUrl;

  return buildPageMeta({
    title,
    ogTitle: title,
    description,
    locale,
    path: `/photography/${gallery.slug}`,
    image,
    imageAlt: title,
    ogImageWidth: OG_IMAGE_WIDTH,
    ogImageHeight: OG_IMAGE_HEIGHT,
  });
}
