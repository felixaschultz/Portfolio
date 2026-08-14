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
  coverSrcSet?: string;
  coverBlurUrl?: string;
};

export type ResponsiveCoverImage = {
  src: string;
  srcSet?: string;
  blurSrc?: string;
  sizes: string;
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
  /** 16:9 hero URLs for the home photography door (first featured gallery only). */
  coverHeroUrl?: string;
  coverHeroSrcSet?: string;
  /** Present when prints/downloads can be purchased from the public shop. */
  shopUrl?: string;
};

export type GalleryDetail = GalleryListItem & {
  images: GalleryImageItem[];
  /** Set when public shop is enabled and a shop token exists. */
  shopUrl?: string;
  /** Direct link to the Flickr album, when images come from Flickr. */
  flickrAlbumUrl?: string;
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
