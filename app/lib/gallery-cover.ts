import type { GalleryImageDocument } from "./sanity.server";

type GalleryWithImages = {
  images?: GalleryImageDocument[];
  coverImageKey?: string;
};

/** Image used for list cards, OG, and featured strips — explicit cover or first photo. */
export function resolveGalleryCoverImage(
  gallery: GalleryWithImages,
): GalleryImageDocument["image"] | null {
  const images = gallery.images ?? [];
  if (images.length === 0) return null;

  if (gallery.coverImageKey) {
    const picked = images.find((item) => item._key === gallery.coverImageKey);
    if (picked?.image) return picked.image;
  }

  return images[0].image ?? null;
}
