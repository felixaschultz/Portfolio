import { createClient, type SanityClient } from "@sanity/client";
import type { GalleryDetail, GalleryImageItem, GalleryListItem, PortfolioPhotoItem } from "./galleries";
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

/** Public site reads — never include draft or version-only documents. */
const PUBLIC_PERSPECTIVE = "published" as const;

export function getSanityClient(): SanityClient | null {
  if (!isSanityConfigured()) return null;
  return createClient({
    projectId: projectId!,
    dataset,
    apiVersion,
    token,
    useCdn: !token,
    perspective: PUBLIC_PERSPECTIVE,
  });
}

function isPublishedDocumentId(id: string): boolean {
  return !id.startsWith("drafts.") && !id.startsWith("versions.");
}

/** When multiple docs share a slug, keep the published canonical id (not drafts.*). */
function dedupeGalleriesBySlug(galleries: GalleryDocument[]): GalleryDocument[] {
  const bySlug = new Map<string, GalleryDocument>();
  for (const gallery of galleries) {
    if (!gallery.slug || !isPublishedDocumentId(gallery._id)) continue;
    const existing = bySlug.get(gallery.slug);
    if (!existing || !isPublishedDocumentId(existing._id)) {
      bySlug.set(gallery.slug, gallery);
    }
  }
  return [...bySlug.values()];
}

export type LocalizedString = { da?: string; de?: string; en?: string };

type SanityImageRef = {
  asset?: { _ref?: string };
  /** From GROQ: asset->metadata.dimensions — kept separate so asset._ref stays intact for image URLs. */
  dimensions?: { width?: number; height?: number };
};

export type GalleryImageDocument = {
  _key: string;
  image: SanityImageRef;
  alt?: string;
  caption?: string | LocalizedString;
};

function imageDimensionsFromAsset(image: SanityImageRef): { width?: number; height?: number } {
  const dims = image.dimensions;
  if (!dims?.width || !dims?.height) return {};
  return { width: dims.width, height: dims.height };
}

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
    image {
      ...,
      "dimensions": asset->metadata.dimensions
    }
  }
}`;

const publishedGalleryFilter = `_type == "gallery" && defined(slug.current) && !(_id in path("drafts.**"))`;

export const GALLERIES_QUERY = `*[${publishedGalleryFilter}] | order(coalesce(sortOrder, 999) asc, takenAt desc) ${galleryProjection}`;

export const FEATURED_GALLERIES_QUERY = `*[${publishedGalleryFilter} && featured == true] | order(coalesce(sortOrder, 999) asc, takenAt desc)[0...8] ${galleryProjection}`;

export const GALLERY_BY_SLUG_QUERY = `*[${publishedGalleryFilter} && slug.current == $slug][0] ${galleryProjection}`;

async function mapGalleryToListItem(
  gallery: GalleryDocument,
  widths: number[],
): Promise<GalleryListItem | null> {
  const { photoSrcSet, photoBlurPlaceholder, photoOgImage } = await import("./image.server");
  const cover = resolveGalleryCoverImage(gallery);
  if (!cover) return null;
  const { src, srcSet } = photoSrcSet(cover, widths, { crop16x9: true });
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
    coverOgUrl: photoOgImage(cover),
    coverSrcSet: srcSet,
    coverBlurUrl: photoBlurPlaceholder(cover),
    coverImageKey: gallery.coverImageKey,
  };
}

async function mapGalleryToDetail(
  gallery: GalleryDocument,
  locale: Locale,
): Promise<GalleryDetail | null> {
  const list = await mapGalleryToListItem(gallery, [1200, 1800, 2400]);
  if (!list) return null;
  const { photoSrcSet, photoBlurPlaceholder } = await import("./image.server");
  const images: GalleryImageItem[] = (gallery.images ?? [])
    .filter((item) => item.image?.asset?._ref)
    .map((item) => {
    const { src, srcSet } = photoSrcSet(item.image, [1200, 1800, 2400, 3200]);
    const caption = resolveSanityString(item.caption, locale);
    const { width, height } = imageDimensionsFromAsset(item.image);
    return {
      _key: item._key,
      imageUrl: src,
      imageSrcSet: srcSet,
      imageBlurUrl: photoBlurPlaceholder(item.image),
      alt: item.alt,
      caption: caption || undefined,
      width,
      height,
    };
  });
  return { ...list, images };
}

export async function fetchGalleries(): Promise<GalleryDocument[]> {
  const client = getSanityClient();
  if (!client) return [];
  try {
    const galleries: GalleryDocument[] = await client.fetch(GALLERIES_QUERY);
    return dedupeGalleriesBySlug(galleries);
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
    const published = dedupeGalleriesBySlug(galleries);
    const items = await Promise.all(
      published.map((g) => mapGalleryToListItem(g, [800, 1200, 1600, 2400])),
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

export async function fetchAllPhotosForIndex(locale: Locale): Promise<PortfolioPhotoItem[]> {
  const galleries = await fetchGalleries();
  const { photoSrcSet, photoBlurPlaceholder } = await import("./image.server");
  const photos: PortfolioPhotoItem[] = [];

  for (const gallery of galleries) {
    if (!gallery.slug) continue;
      for (const item of gallery.images ?? []) {
      if (!item?.image?.asset?._ref || !item._key) continue;
      const { src, srcSet } = photoSrcSet(item.image, [480, 800, 1200, 1600]);
      const caption = resolveSanityString(item.caption, locale);
      const { width, height } = imageDimensionsFromAsset(item.image);
      photos.push({
        _key: item._key,
        imageUrl: src,
        imageSrcSet: srcSet,
        imageBlurUrl: photoBlurPlaceholder(item.image),
        alt: item.alt,
        caption: caption || undefined,
        width,
        height,
        gallerySlug: gallery.slug,
        galleryTitle: gallery.title,
        galleryTags: gallery.tags,
      });
    }
  }

  return photos;
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
