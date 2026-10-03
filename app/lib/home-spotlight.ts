import type { GalleryImageItem } from "./galleries";
import type { LocalizedString } from "./sanity.server";

export type HomeSpotlightSlide = GalleryImageItem & {
  gallerySlug: string;
  galleryTitle: LocalizedString;
  imageObjectPosition?: string;
  /** CSS zoom approximating a Studio crop's zoom when there's no server-side crop (Flickr images). */
  imageScale?: number;
};

export const MAX_HOME_SPOTLIGHT_SLIDES = 8;
