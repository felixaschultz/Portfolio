import type { GalleryCategoryRef, GalleryListItem } from "./galleries";
import { localizedField, type Locale } from "./i18n";

export type GalleryCategoryOption = {
  slug: string;
  label: string;
  description?: string;
};

/** Photography index category filter path. */
export function photographyCategoryPath(locale: string, categorySlug: string | null): string {
  const base = `/${locale}/photography`;
  if (!categorySlug) return base;
  return `${base}/category/${categorySlug}`;
}

export function categoryLabel(category: GalleryCategoryRef, locale: Locale): string {
  return localizedField(category.title, locale) || category.slug;
}

/** Build filter options from published category documents (preferred). */
export function categoryOptionsFromRefs(
  categories: GalleryCategoryRef[],
  locale: Locale,
): GalleryCategoryOption[] {
  return categories
    .filter((c) => c.slug)
    .map((c) => {
      const description = localizedField(c.description, locale) || undefined;
      return { slug: c.slug, label: categoryLabel(c, locale), description };
    })
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
}

/** Fallback: unique categories inferred from gallery list only. */
export function collectGalleryCategories(
  galleries: GalleryListItem[],
  locale: Locale,
): GalleryCategoryOption[] {
  const bySlug = new Map<string, string>();
  for (const gallery of galleries) {
    for (const category of gallery.categories ?? []) {
      if (!category.slug) continue;
      const label = categoryLabel(category, locale);
      if (!bySlug.has(category.slug)) bySlug.set(category.slug, label);
    }
  }
  return [...bySlug.entries()]
    .map(([slug, label]) => ({ slug, label }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
}

export function categoryFromParam(
  param: string,
  categories: GalleryCategoryOption[],
): GalleryCategoryOption | null {
  const normalized = param.trim().toLowerCase();
  if (!normalized) return null;
  return categories.find((c) => c.slug.toLowerCase() === normalized) ?? null;
}

export function galleryHasCategory(gallery: GalleryListItem, categorySlug: string): boolean {
  const normalized = categorySlug.trim().toLowerCase();
  return (gallery.categories ?? []).some((c) => c.slug.toLowerCase() === normalized);
}

export function resolveActiveCategorySlug(
  param: string,
  categoryOptions: GalleryCategoryOption[],
): string | null {
  return categoryFromParam(param, categoryOptions)?.slug ?? null;
}
