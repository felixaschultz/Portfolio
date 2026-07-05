import type { GalleryImageDocument } from "./sanity.server";

type GalleryWithImages = {
  images?: GalleryImageDocument[];
  coverImageKey?: string;
};

/** First image document in gallery order (album opener). */
export function resolveGalleryFirstImage(gallery: GalleryWithImages): GalleryImageDocument | null {
  return gallery.images?.[0] ?? null;
}

/** Image document used for list cards, OG, and featured strips — explicit cover or first photo. */
export function resolveGalleryCoverImage(gallery: GalleryWithImages): GalleryImageDocument | null {
  const images = gallery.images ?? [];
  if (images.length === 0) return null;

  if (gallery.coverImageKey) {
    const picked = images.find((item) => item._key === gallery.coverImageKey);
    if (picked) return picked;
  }

  return images[0] ?? null;
}
