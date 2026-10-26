import type { GalleryImageItem } from "./galleries";
import type { LocalizedString } from "./sanity.server";

export type HomeSelectedWorkPhoto = GalleryImageItem & {
  gallerySlug: string;
  galleryTitle: LocalizedString;
  imageObjectPosition?: string;
  /** CSS zoom approximating a Studio crop's zoom when there's no server-side crop (Flickr images). */
  imageScale?: number;
};

export const MAX_HOME_SELECTED_WORK = 12;
