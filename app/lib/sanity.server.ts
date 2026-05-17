import { createClient, type SanityClient } from "@sanity/client";
import type { GalleryDetail, GalleryImageItem, GalleryListItem } from "./galleries";
import { resolveGalleryCoverImage } from "./gallery-cover";
import type { Locale } from "./i18n";
import { resolveSanityString } from "./i18n";
import type { Project } from "./projects";

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

type SanityImageRef = {
  asset: { _ref: string };
};

export type GalleryImageDocument = {
  _key: string;
  image: SanityImageRef;
  alt?: string;
  caption?: string | LocalizedString;
};

export type GalleryDocument = {
  _id: string;
  slug: string;
  title: LocalizedString;
  description?: LocalizedString;
  takenAt?: string;
  location?: string;
  tags?: string[];
  featured?: boolean;
  sortOrder?: number;
  coverImageKey?: string;
  images: GalleryImageDocument[];
};

/** @deprecated Use gallery documents instead */
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
  image: SanityImageRef;
};

const galleryProjection = `{
  _id,
  "slug": slug.current,
  title,
  description,
  takenAt,
  location,
  tags,
  featured,
  sortOrder,
  coverImageKey,
  images[] {
    _key,
    alt,
    caption,
    image
  }
}`;

export const GALLERIES_QUERY = `*[_type == "gallery"] | order(coalesce(sortOrder, 999) asc, takenAt desc) ${galleryProjection}`;

export const FEATURED_GALLERIES_QUERY = `*[_type == "gallery" && featured == true] | order(coalesce(sortOrder, 999) asc, takenAt desc)[0...8] ${galleryProjection}`;

export const GALLERY_BY_SLUG_QUERY = `*[_type == "gallery" && slug.current == $slug][0] ${galleryProjection}`;

async function mapGalleryToListItem(
  gallery: GalleryDocument,
  widths: number[],
): Promise<GalleryListItem | null> {
  const { photoSrcSet } = await import("./image.server");
  const cover = resolveGalleryCoverImage(gallery);
  if (!cover) return null;
  const { src, srcSet } = photoSrcSet(cover, widths);
  return {
    _id: gallery._id,
    slug: gallery.slug,
    title: gallery.title,
    description: gallery.description,
    takenAt: gallery.takenAt,
    location: gallery.location,
    tags: gallery.tags,
    featured: gallery.featured,
    imageCount: gallery.images?.length ?? 0,
    coverUrl: src,
    coverSrcSet: srcSet,
    coverImageKey: gallery.coverImageKey,
  };
}

async function mapGalleryToDetail(
  gallery: GalleryDocument,
  locale: Locale,
): Promise<GalleryDetail | null> {
  const list = await mapGalleryToListItem(gallery, [600, 900]);
  if (!list) return null;
  const { photoSrcSet } = await import("./image.server");
  const images: GalleryImageItem[] = (gallery.images ?? []).map((item) => {
    const { src, srcSet } = photoSrcSet(item.image, [1200, 1800, 2400, 3200]);
    const caption = resolveSanityString(item.caption, locale);
    return {
      _key: item._key,
      imageUrl: src,
      imageSrcSet: srcSet,
      alt: item.alt,
      caption: caption || undefined,
    };
  });
  return { ...list, images };
}

export async function fetchGalleries(): Promise<GalleryDocument[]> {
  const client = getSanityClient();
  if (!client) return [];
  try {
    return await client.fetch(GALLERIES_QUERY);
  } catch {
    return [];
  }
}

export async function fetchGalleryBySlug(slug: string): Promise<GalleryDocument | null> {
  const client = getSanityClient();
  if (!client) return null;
  try {
    return await client.fetch(GALLERY_BY_SLUG_QUERY, { slug });
  } catch {
    return null;
  }
}

export async function fetchGalleriesForList(): Promise<GalleryListItem[]> {
  const galleries = await fetchGalleries();
  const items = await Promise.all(
    galleries.map((g) => mapGalleryToListItem(g, [800, 1200, 1600, 2400])),
  );
  return items.filter((g): g is GalleryListItem => g !== null);
}

export async function fetchFeaturedGalleriesForList(): Promise<GalleryListItem[]> {
  const client = getSanityClient();
  if (!client) return [];
  try {
    const galleries: GalleryDocument[] = await client.fetch(FEATURED_GALLERIES_QUERY);
    const items = await Promise.all(
      galleries.map((g) => mapGalleryToListItem(g, [800, 1200, 1600, 2400])),
    );
    return items.filter((g): g is GalleryListItem => g !== null);
  } catch {
    return [];
  }
}

export async function fetchGalleryDetailBySlug(
  slug: string,
  locale: Locale,
): Promise<GalleryDetail | null> {
  const gallery = await fetchGalleryBySlug(slug);
  if (!gallery) return null;
  return mapGalleryToDetail(gallery, locale);
}

export type SanityProjectDocument = {
  id: string;
  name: string;
  screenshot?: string;
  highlight?: boolean;
  description?: LocalizedString;
  shortDescription?: LocalizedString;
  github?: string | null;
  url?: string | null;
  type?: string;
  technology?: string;
  sortOrder?: number;
};

const PROJECTS_QUERY = `*[_type == "project"] | order(coalesce(sortOrder, 999) asc, name asc) {
  "id": slug.current,
  name,
  screenshot,
  highlight,
  description,
  shortDescription,
  github,
  url,
  type,
  technology,
  sortOrder
}`;

function localizedField(field: LocalizedString | undefined): Project["description"] {
  return {
    da: field?.da ?? "",
    de: field?.de ?? "",
    en: field?.en ?? "",
  };
}

function mapSanityProject(doc: SanityProjectDocument): Project {
  return {
    id: doc.id,
    name: doc.name,
    screenshot: doc.screenshot?.trim() ? doc.screenshot : null,
    highlight: Boolean(doc.highlight),
    description: localizedField(doc.description),
    short_description: localizedField(doc.shortDescription),
    github: doc.github || null,
    url: doc.url || null,
    type: doc.type ?? "",
    technology: doc.technology ?? "",
  };
}

export async function fetchProjectsFromSanity(): Promise<Project[]> {
  const client = getSanityClient();
  if (!client) return [];
  try {
    const docs: SanityProjectDocument[] = await client.fetch(PROJECTS_QUERY);
    return docs.filter((d) => d?.id).map(mapSanityProject);
  } catch {
    return [];
  }
}
