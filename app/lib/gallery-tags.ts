import type { GalleryListItem } from "./galleries";

/** URL-safe tag slug (lowercase, spaces → hyphens). */
export function tagToParam(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, "-");
}

/** Photography index or tag filter path (no query strings). */
export function photographyTagPath(locale: string, tag: string | null): string {
  const base = `/${locale}/photography`;
  if (!tag) return base;
  return `${base}/tag/${tagToParam(tag)}`;
}

/** Unique tags across galleries, sorted A–Z (display casing from first occurrence). */
export function collectGalleryTags(galleries: GalleryListItem[]): string[] {
  const byParam = new Map<string, string>();
  for (const gallery of galleries) {
    for (const tag of gallery.tags ?? []) {
      const trimmed = tag.trim();
      if (!trimmed) continue;
      const param = tagToParam(trimmed);
      if (!byParam.has(param)) byParam.set(param, trimmed);
    }
  }
  return [...byParam.values()].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

export function tagFromParam(param: string, tags: string[]): string | null {
  const normalized = param.trim().toLowerCase();
  if (!normalized) return null;
  return tags.find((tag) => tagToParam(tag) === normalized) ?? null;
}

export function galleryHasTag(gallery: GalleryListItem, tag: string): boolean {
  const param = tagToParam(tag);
  return (gallery.tags ?? []).some((t) => tagToParam(t) === param);
}
