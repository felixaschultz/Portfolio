import type { GalleryImageItem } from "./galleries";
import type { LocalizedString } from "./sanity.server";

export type HomeFavoritePhoto = GalleryImageItem & {
  gallerySlug: string;
  galleryTitle: LocalizedString;
};

export const MAX_HOME_FAVORITES = 5;
