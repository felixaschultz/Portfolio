import type { GalleryListItem, ResponsiveCoverImage } from "./galleries";

/** Lead featured gallery on the home page (first image, 16:9 hero). */
export function resolveHomePhotoCover(
  featuredGalleries: GalleryListItem[],
): ResponsiveCoverImage | null {
  const leadGallery = featuredGalleries[0];
  if (!leadGallery) return null;

  return {
    src: leadGallery.coverHeroUrl ?? leadGallery.coverUrl,
    srcSet: leadGallery.coverHeroSrcSet ?? leadGallery.coverSrcSet,
    blurSrc: leadGallery.coverBlurUrl,
    sizes: "100vw",
  };
}
