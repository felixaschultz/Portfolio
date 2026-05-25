import type { HomeFavoritePhoto } from "./home-favorites";
import type { GalleryListItem, ResponsiveCoverImage } from "./galleries";
import {
  INTASTELLAR_SIGNIN_COVER_VARIANTS,
  staticImageSrcSet,
} from "./static-image";

export function resolveHomePhotoCover(
  favoritePhotos: HomeFavoritePhoto[],
  featuredGalleries: GalleryListItem[],
): ResponsiveCoverImage | null {
  const leadFavorite = favoritePhotos.at(-1) ?? favoritePhotos[0];
  if (leadFavorite) {
    return {
      src: leadFavorite.imageUrl,
      srcSet: leadFavorite.imageSrcSet,
      blurSrc: leadFavorite.imageBlurUrl,
      sizes: "(max-width: 1023px) 100vw, 50vw",
    };
  }

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
