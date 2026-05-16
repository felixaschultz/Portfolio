import { createClient, type SanityClient } from "@sanity/client";

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET ?? "production";
const apiVersion = process.env.SANITY_API_VERSION ?? "2024-05-16";
const token = process.env.SANITY_API_TOKEN;

export function isSanityConfigured(): boolean {
  return Boolean(projectId && projectId !== "placeholder");
}

export function getSanityClient(): SanityClient | null {
  if (!isSanityConfigured()) return null;
  return createClient({
    projectId: projectId!,
    dataset,
    apiVersion,
    token,
    useCdn: !token,
  });
}

export type LocalizedString = { da?: string; de?: string; en?: string };

export type PhotoDocument = {
  _id: string;
  slug: string;
  title: LocalizedString;
  caption?: LocalizedString;
  takenAt?: string;
  location?: string;
  tags?: string[];
  featured?: boolean;
  sortOrder?: number;
  image: {
    asset: { _ref: string };
  };
};

export const PHOTOS_QUERY = `*[_type == "photo"] | order(coalesce(sortOrder, 999) asc, takenAt desc) {
  _id,
  "slug": slug.current,
  title,
  caption,
  takenAt,
  location,
  tags,
  featured,
  sortOrder,
  image
}`;

export const FEATURED_PHOTOS_QUERY = `*[_type == "photo" && featured == true] | order(coalesce(sortOrder, 999) asc, takenAt desc)[0...8] {
  _id,
  "slug": slug.current,
  title,
  caption,
  takenAt,
  location,
  tags,
  featured,
  sortOrder,
  image
}`;

export const PHOTO_BY_SLUG_QUERY = `*[_type == "photo" && slug.current == $slug][0] {
  _id,
  "slug": slug.current,
  title,
  caption,
  takenAt,
  location,
  tags,
  featured,
  sortOrder,
  image
}`;

export async function fetchPhotos(): Promise<PhotoDocument[]> {
  const client = getSanityClient();
  if (!client) return [];
  try {
    return await client.fetch(PHOTOS_QUERY);
  } catch {
    return [];
  }
}

export async function fetchFeaturedPhotos(): Promise<PhotoDocument[]> {
  const client = getSanityClient();
  if (!client) return [];
  try {
    return await client.fetch(FEATURED_PHOTOS_QUERY);
  } catch {
    return [];
  }
}

export async function fetchPhotoBySlug(slug: string): Promise<PhotoDocument | null> {
  const client = getSanityClient();
  if (!client) return null;
  try {
    return await client.fetch(PHOTO_BY_SLUG_QUERY, { slug });
  } catch {
    return null;
  }
}

export async function fetchPhotosForList(): Promise<import("./photos").PhotoListItem[]> {
  const { photoSrcSet } = await import("./image.server");
  const photos = await fetchPhotos();
  return photos.map((photo) => {
    const { src, srcSet } = photoSrcSet(photo.image);
    return {
      _id: photo._id,
      slug: photo.slug,
      title: photo.title,
      caption: photo.caption,
      takenAt: photo.takenAt,
      location: photo.location,
      tags: photo.tags,
      featured: photo.featured,
      imageUrl: src,
      imageSrcSet: srcSet,
    };
  });
}

export async function fetchFeaturedPhotosForList(): Promise<import("./photos").PhotoListItem[]> {
  const { photoSrcSet } = await import("./image.server");
  const photos = await fetchFeaturedPhotos();
  return photos.map((photo) => {
    const { src, srcSet } = photoSrcSet(photo.image, [400, 600, 800]);
    return {
      _id: photo._id,
      slug: photo.slug,
      title: photo.title,
      caption: photo.caption,
      takenAt: photo.takenAt,
      location: photo.location,
      tags: photo.tags,
      featured: photo.featured,
      imageUrl: src,
      imageSrcSet: srcSet,
    };
  });
}

export async function fetchPhotoDetailBySlug(
  slug: string,
): Promise<import("./photos").PhotoDetail | null> {
  const photo = await fetchPhotoBySlug(slug);
  if (!photo) return null;
  const { photoSrcSet } = await import("./image.server");
  const { src, srcSet } = photoSrcSet(photo.image, [800, 1200, 1800, 2400]);
  return {
    _id: photo._id,
    slug: photo.slug,
    title: photo.title,
    caption: photo.caption,
    takenAt: photo.takenAt,
    location: photo.location,
    tags: photo.tags,
    featured: photo.featured,
    imageUrl: src,
    imageSrcSet: srcSet,
  };
}
