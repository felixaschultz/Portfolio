import type { GalleryDetail, GalleryImageItem, GalleryListItem, PortfolioPhotoItem } from "./galleries";
import { formatGalleryDate } from "./format-gallery-date";
import { INITIAL_GALLERY_BATCH } from "./gallery-performance";
import { localizedField, type Locale } from "./i18n";
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH, SITE_NAME, buildPageMeta, getSiteUrl, pageUrl } from "./seo";
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

const PHOTOGRAPHER = { "@type": "Person", name: SITE_NAME, url: getSiteUrl() } as const;

function imageObjectFor(image: GalleryImageItem): Record<string, unknown> {
  const contentUrl = image.imageFullUrl || image.imageUrl;
  const obj: Record<string, unknown> = {
    "@type": "ImageObject",
    contentUrl,
    url: contentUrl,
    creator: PHOTOGRAPHER,
    copyrightHolder: PHOTOGRAPHER,
    creditText: SITE_NAME,
  };
  if (image.imageUrl && image.imageUrl !== contentUrl) obj.thumbnailUrl = image.imageUrl;
  const caption = image.caption || image.alt;
  if (caption) {
    obj.caption = caption;
    obj.description = caption;
  }
  if (image.width) obj.width = image.width;
  if (image.height) obj.height = image.height;
  return obj;
}

/** schema.org ImageGallery for a single gallery page — helps individual photos surface in Google Images. */
export function buildGalleryJsonLd(gallery: GalleryDetail, locale: Locale): Record<string, unknown> {
  const title = localizedField(gallery.title, locale) || seoCopy(locale, "photographyTitle");

  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: title,
    description: galleryMetaDescription(gallery, locale),
    url: pageUrl(locale, `/photography/${gallery.slug}`),
    ...(gallery.takenAt ? { datePublished: gallery.takenAt } : {}),
    author: PHOTOGRAPHER,
    image: gallery.images.slice(0, INITIAL_GALLERY_BATCH).map(imageObjectFor),
  };
}

/** Per-gallery document + Open Graph / Twitter meta, plus ImageGallery structured data. */
export function buildGalleryPageMeta(gallery: GalleryDetail, locale: Locale) {
  const title = localizedField(gallery.title, locale) || seoCopy(locale, "photographyTitle");
  const description = galleryMetaDescription(gallery, locale);
  const image = gallery.coverOgUrl || gallery.coverUrl || gallery.images[0]?.imageUrl;

  return [
    ...buildPageMeta({
      title,
      ogTitle: title,
      description,
      locale,
      path: `/photography/${gallery.slug}`,
      image,
      imageAlt: title,
      ogImageWidth: OG_IMAGE_WIDTH,
      ogImageHeight: OG_IMAGE_HEIGHT,
    }),
    { "script:ld+json": buildGalleryJsonLd(gallery, locale) },
  ];
}

/** schema.org CollectionPage + ItemList for the /photography listing page. */
export function buildPhotographyListJsonLd(
  galleries: GalleryListItem[],
  locale: Locale,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: seoCopy(locale, "photographyTitle"),
    description: seoCopy(locale, "photographyDescription"),
    url: pageUrl(locale, "/photography"),
    author: PHOTOGRAPHER,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: galleries.map((gallery, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: pageUrl(locale, `/photography/${gallery.slug}`),
        name: localizedField(gallery.title, locale) || "Gallery",
      })),
    },
  };
}

/** schema.org ImageGallery for the cross-gallery "all photos" wall — same per-photo ImageObject
 * treatment as a single gallery page, plus which gallery each photo belongs to. */
export function buildAllPhotosJsonLd(
  photos: PortfolioPhotoItem[],
  locale: Locale,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: seoCopy(locale, "allPhotosTitle"),
    description: seoCopy(locale, "allPhotosDescription"),
    url: pageUrl(locale, "/photography/photos"),
    author: PHOTOGRAPHER,
    image: photos.slice(0, INITIAL_GALLERY_BATCH).map((photo) => ({
      ...imageObjectFor(photo),
      isPartOf: pageUrl(locale, `/photography/${photo.gallerySlug}`),
    })),
  };
}
