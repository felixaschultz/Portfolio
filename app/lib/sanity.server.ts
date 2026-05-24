import { createClient, type SanityClient } from "@sanity/client";
import {
  resolvePublicGalleryShopUrl,
  type GalleryDetail,
  type GalleryImageItem,
  type GalleryListItem,
  type GalleryNavItem,
  type PortfolioPhotoItem,
} from "./galleries";
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

/**
 * Token-gated gallery ZIP downloads. Uses draft content when present so the link
 * works before the gallery is published. Requires SANITY_API_TOKEN with read access.
 */
export function getSanityDownloadClient(): SanityClient | null {
  if (!isSanityConfigured()) return null;
  if (!token) return getSanityClient();
  return createClient({
    projectId: projectId!,
    dataset,
    apiVersion,
    token,
    useCdn: false,
    perspective: "previewDrafts",
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

export type GalleryCategoryRef = {
  slug: string;
  title: LocalizedString;
};

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

/** Server-only — keep in sync with gallery-performance.ts (not imported to avoid bundle interop). */
const LARGE_GALLERY_IMAGE_THRESHOLD = 32;
const GRID_SRC_WIDTHS = [480, 720, 1080, 1440];
const GRID_SRC_WIDTHS_LARGE = [360, 540, 720, 960, 1200];

function isLargeGalleryImageCount(imageCount: number): boolean {
  return imageCount > LARGE_GALLERY_IMAGE_THRESHOLD;
}

function gridSrcWidthsForCount(imageCount: number): number[] {
  return isLargeGalleryImageCount(imageCount) ? GRID_SRC_WIDTHS_LARGE : GRID_SRC_WIDTHS;
}

export type GalleryDocument = {
  _id: string;
  slug: string;
  title: LocalizedString;
  description?: LocalizedString;
  takenAt?: string;
  location?: string;
  tags?: string[];
  categories?: GalleryCategoryRef[];
  featured?: boolean;
  sortOrder?: number;
  coverImageKey?: string;
  shopPublicEnabled?: boolean;
  shopToken?: string;
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
  "tags": array::unique(array::compact(tags[]->name)),
  "categories": categories[]->{
    "slug": slug.current,
    title
  },
  featured,
  sortOrder,
  coverImageKey,
  shopPublicEnabled,
  shopToken,
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

const galleryShopFields = `
  shopPublicEnabled,
  shopToken`;

const galleryDetailProjection = `{
  _id,
  "slug": slug.current,
  title,
  description,
  takenAt,
  location,
  "tags": array::unique(array::compact(tags[]->name)),
  "categories": categories[]->{
    "slug": slug.current,
    title
  },
  featured,
  sortOrder,
  coverImageKey,${galleryShopFields},
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

export const GALLERY_BY_SLUG_QUERY = `*[${publishedGalleryFilter} && slug.current == $slug][0] ${galleryDetailProjection}`;

const GALLERY_NAV_QUERY = `*[${publishedGalleryFilter}] | order(coalesce(sortOrder, 999) asc, takenAt desc) {
  _id,
  "slug": slug.current,
  title,
  coverImageKey,
  images[] {
    _key,
    image {
      asset->{ _id },
      "dimensions": asset->metadata.dimensions
    }
  }
}`;

const publishedCategoryFilter = `_type == "galleryCategory" && defined(slug.current) && !(_id in path("drafts.**"))`;

export const GALLERY_CATEGORIES_QUERY = `*[${publishedCategoryFilter}] | order(coalesce(title.en, title.da, title.de) asc) {
  "slug": slug.current,
  title
}`;

async function mapGalleryToListItem(
  gallery: GalleryDocument,
  widths: readonly number[] | number[],
  options?: import("./image.server").PhotoSrcSetOptions & {
    includeHomeHero?: boolean;
  },
): Promise<GalleryListItem | null> {
  const { photoSrcSet, photoBlurPlaceholder, photoOgImage, COVER_WIDTHS_HOME_HERO } =
    await import("./image.server");
  const cover = resolveGalleryCoverImage(gallery);
  if (!cover) return null;
  const { toSanityImageSource } = await import("./image.server");
  const coverSource = toSanityImageSource(cover);
  const { includeHomeHero, ...fitOptions } = options ?? {};
  const { src, srcSet } = photoSrcSet(coverSource, widths, fitOptions);
  const hero =
    includeHomeHero ?
      photoSrcSet(coverSource, COVER_WIDTHS_HOME_HERO, { fit: "16x9" })
    : null;
  return {
    _id: gallery._id,
    slug: gallery.slug,
    title: gallery.title,
    description: gallery.description,
    takenAt: gallery.takenAt,
    location: gallery.location,
    tags: gallery.tags,
    categories: gallery.categories?.filter((c) => c?.slug) ?? [],
    featured: gallery.featured,
    imageCount: gallery.images?.length ?? 0,
    coverUrl: src,
    coverOgUrl: photoOgImage(coverSource),
    coverSrcSet: srcSet,
    coverBlurUrl: photoBlurPlaceholder(coverSource),
    coverImageKey: gallery.coverImageKey,
    coverHeroUrl: hero?.src,
    coverHeroSrcSet: hero?.srcSet,
    shopUrl: resolvePublicGalleryShopUrl(gallery),
  };
}

async function mapGalleryToDetail(
  gallery: GalleryDocument,
  locale: Locale,
): Promise<GalleryDetail | null> {
  const list = await mapGalleryToListItem(gallery, [1200, 1800, 2400], { fit: "16x9" });
  if (!list) return null;
  const { photoSrcSet, photoBlurPlaceholder, toSanityImageSource } = await import("./image.server");
  const imageCount = gallery.images?.length ?? 0;
  const large = isLargeGalleryImageCount(imageCount);
  const gridWidths = gridSrcWidthsForCount(imageCount);
  const images: GalleryImageItem[] = [];

  for (const item of gallery.images ?? []) {
    if (!item.image?.asset?._ref) continue;

    try {
      const source = toSanityImageSource(item.image);
      const { src, srcSet } = photoSrcSet(source, gridWidths);
      if (!src) continue;

      const caption = resolveSanityString(item.caption, locale);
      const { width, height } = imageDimensionsFromAsset(item.image);

      images.push({
        _key: item._key,
        imageUrl: src,
        imageSrcSet: srcSet,
        imageFullUrl: large ? undefined : src,
        imageFullSrcSet: large ? undefined : srcSet,
        imageBlurUrl: photoBlurPlaceholder(source),
        alt: item.alt,
        caption: caption || undefined,
        width,
        height,
      });
    } catch {
      continue;
    }
  }

  const shopUrl = resolvePublicGalleryShopUrl(gallery);

  return { ...list, images, ...(shopUrl ? { shopUrl } : {}) };
}

export async function fetchGalleries(): Promise<GalleryDocument[]> {
  const client = getSanityClient();
  if (!client) return [];
  try {
    const galleries: GalleryDocument[] = await client.fetch(GALLERIES_QUERY);
    return dedupeGalleriesBySlug(galleries);
  } catch (err) {
    console.error("[sanity] fetchGalleries failed:", err);
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

export async function fetchPublishedGalleryCategories(): Promise<GalleryCategoryRef[]> {
  const client = getSanityClient();
  if (!client) return [];
  try {
    return await client.fetch(GALLERY_CATEGORIES_QUERY);
  } catch {
    return [];
  }
}

export async function fetchGalleriesForList(): Promise<GalleryListItem[]> {
  const { COVER_WIDTHS_OVERVIEW } = await import("./image.server");
  const galleries = await fetchGalleries();
  const items = await Promise.all(
    galleries.map((g) => mapGalleryToListItem(g, COVER_WIDTHS_OVERVIEW, { fit: "16x9" })),
  );
  return items.filter((g): g is GalleryListItem => g !== null);
}

/** Lightweight prev/next nav — one cover URL per gallery, no full image grids. */
export async function fetchGalleryNavList(): Promise<GalleryNavItem[]> {
  const client = getSanityClient();
  if (!client) return [];

  try {
    const galleries: GalleryDocument[] = await client.fetch(GALLERY_NAV_QUERY);
    const published = dedupeGalleriesBySlug(galleries);
    const { photoSrcSet, photoBlurPlaceholder, toSanityImageSource, COVER_WIDTHS_NAV } =
      await import("./image.server");

    const items: GalleryNavItem[] = [];
    for (const gallery of published) {
      if (!gallery.slug) continue;
      const cover = resolveGalleryCoverImage(gallery);
      if (!cover) continue;

      const source = toSanityImageSource(cover);
      const { src, srcSet } = photoSrcSet(source, COVER_WIDTHS_NAV, { fit: "16x9" });
      if (!src) continue;

      items.push({
        slug: gallery.slug,
        title: gallery.title,
        coverUrl: src,
        coverSrcSet: srcSet,
        coverBlurUrl: photoBlurPlaceholder(source),
      });
    }

    return items;
  } catch (err) {
    console.error("[sanity] fetchGalleryNavList failed:", err);
    return [];
  }
}

export async function fetchFeaturedGalleriesForList(): Promise<GalleryListItem[]> {
  const { COVER_WIDTHS_HOME_TILE } = await import("./image.server");
  const client = getSanityClient();
  if (!client) return [];
  try {
    const galleries: GalleryDocument[] = await client.fetch(FEATURED_GALLERIES_QUERY);
    const published = dedupeGalleriesBySlug(galleries);
    const items = await Promise.all(
      published.map((g, index) =>
        mapGalleryToListItem(g, COVER_WIDTHS_HOME_TILE, {
          fit: "square",
          includeHomeHero: index === 0,
        }),
      ),
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
  const { toSanityImageSource } = await import("./image.server");
  const photos: PortfolioPhotoItem[] = [];

  for (const gallery of galleries) {
    if (!gallery.slug) continue;
    for (const item of gallery.images ?? []) {
      if (!item?.image?.asset?._ref || !item._key) continue;
      const { src, srcSet } = photoSrcSet(toSanityImageSource(item.image), GRID_SRC_WIDTHS_LARGE);
      const caption = resolveSanityString(item.caption, locale);
      const { width, height } = imageDimensionsFromAsset(item.image);
      photos.push({
        _key: item._key,
        imageUrl: src,
        imageSrcSet: srcSet,
        imageBlurUrl: photoBlurPlaceholder(toSanityImageSource(item.image)),
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
