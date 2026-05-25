import type { GalleryImageItem } from "./galleries";
import type { LocalizedString } from "./sanity.server";

export type HomeFavoritePhoto = GalleryImageItem & {
  gallerySlug: string;
  galleryTitle: LocalizedString;
  /** CSS object-position from Studio card crop (e.g. "52% 38%"). */
  imageObjectPosition?: string;
};

export const MAX_HOME_FAVORITES = 5;
