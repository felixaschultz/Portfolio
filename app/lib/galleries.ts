import type { LocalizedString } from "./sanity.server";

export type GalleryImageItem = {
  _key: string;
  imageUrl: string;
  imageSrcSet: string;
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
};

/** Single image in the cross-gallery “all photos” index. */
export type PortfolioPhotoItem = GalleryImageItem & {
  gallerySlug: string;
  galleryTitle: LocalizedString;
  galleryTags?: string[];
};
