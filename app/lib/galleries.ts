import type { LocalizedString } from "./sanity.server";

export type GalleryImageItem = {
  _key: string;
  imageUrl: string;
  imageSrcSet: string;
  alt?: string;
  caption?: string;
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
  coverSrcSet: string;
};

export type GalleryDetail = GalleryListItem & {
  images: GalleryImageItem[];
};
