import type { GalleryImageItem } from "./galleries";
import type { LocalizedString } from "./sanity.server";

export type HomeSpotlightSlide = GalleryImageItem & {
  gallerySlug: string;
  galleryTitle: LocalizedString;
  imageObjectPosition?: string;
};

export const MAX_HOME_SPOTLIGHT_SLIDES = 8;
