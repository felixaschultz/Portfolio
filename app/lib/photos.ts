import type { LocalizedString, PhotoDocument } from "./sanity.server";

export type PhotoListItem = {
  _id: string;
  slug: string;
  title: LocalizedString;
  caption?: LocalizedString;
  takenAt?: string;
  location?: string;
  tags?: string[];
  featured?: boolean;
  imageUrl: string;
  imageSrcSet: string;
};

export type PhotoDetail = PhotoListItem;
