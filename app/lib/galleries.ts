import type { GalleryCategoryRef, LocalizedString } from "./sanity.server";

export type { GalleryCategoryRef };

export type GalleryImageItem = {
  _key: string;
  imageUrl: string;
  imageSrcSet: string;
  /** Full-resolution URLs for lightbox (used when grid uses smaller variants). */
  imageFullUrl?: string;
  imageFullSrcSet?: string;
  imageBlurUrl?: string;
  alt?: string;
  caption?: string;
  /** Original asset dimensions for mosaic layout. */
  width?: number;
  height?: number;
};

export type GalleryNavItem = {
  slug: string;
  title: LocalizedString;
  coverUrl: string;
  coverBlurUrl?: string;
};

export type GalleryListItem = {
  _id: string;
  slug: string;
  title: LocalizedString;
  description?: LocalizedString;
  takenAt?: string;
  location?: string;
  tags?: string[];
  categories?: GalleryCategoryRef[];
  featured?: boolean;
  imageCount: number;
  coverUrl: string;
  /** 1200×630 crop for Open Graph / Twitter cards */
  coverOgUrl: string;
  coverSrcSet: string;
  coverBlurUrl?: string;
  coverImageKey?: string;
};

export type GalleryDetail = GalleryListItem & {
  images: GalleryImageItem[];
  /** Set when public shop is enabled and a shop token exists. */
  shopUrl?: string;
};

export function resolvePublicGalleryShopUrl(gallery: {
  shopPublicEnabled?: boolean;
  shopToken?: string;
}): string | undefined {
  if (!gallery.shopPublicEnabled) return undefined;
  const token = gallery.shopToken?.trim();
  if (!token) return undefined;
  return `/shop/gallery/${encodeURIComponent(token)}`;
}

/** Single image in the cross-gallery “all photos” index. */
export type PortfolioPhotoItem = GalleryImageItem & {
  gallerySlug: string;
  galleryTitle: LocalizedString;
  galleryTags?: string[];
};
