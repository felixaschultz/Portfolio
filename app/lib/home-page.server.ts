import type { GalleryListItem, ResponsiveCoverImage } from "./galleries";
import {
  INTASTELLAR_SIGNIN_COVER_VARIANTS,
  staticImageSrcSet,
} from "./static-image";

/** Photography door — lead featured gallery on the home page (first image, 16:9 hero). */
export function resolveHomePhotoCover(
  featuredGalleries: GalleryListItem[],
): ResponsiveCoverImage | null {
  const leadGallery = featuredGalleries[0];
  if (!leadGallery) return null;

  return {
    src: leadGallery.coverHeroUrl ?? leadGallery.coverUrl,
    srcSet: leadGallery.coverHeroSrcSet ?? leadGallery.coverSrcSet,
    blurSrc: leadGallery.coverBlurUrl,
    sizes: "(max-width: 1023px) 100vw, 50vw",
  };
}

export function resolveHomeDevCover(
  screenshot: string | null | undefined,
): Pick<ResponsiveCoverImage, "src" | "srcSet" | "sizes"> | null {
  if (!screenshot) return null;
  if (screenshot.includes("intastellarsignin")) {
    const { src, srcSet } = staticImageSrcSet(INTASTELLAR_SIGNIN_COVER_VARIANTS);
    return { src, srcSet, sizes: "(max-width: 1023px) 100vw, 50vw" };
  }
  return { src: screenshot, sizes: "(max-width: 1023px) 100vw, 50vw" };
}
