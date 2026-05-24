import type { Locale } from "./i18n";
import { localizedField } from "./i18n";
import { getProjects } from "./projects.server";
import { getLocalizedText } from "./projects";
import type { SearchIndexItem } from "./search";
import { fetchGalleries } from "./sanity.server";
import { seoCopy } from "./seo-copy";
import { stripHtml } from "./seo";

export type { SearchIndexItem, SearchResultType } from "./search";

function pageItem(
  locale: Locale,
  id: string,
  title: string,
  excerpt: string,
  path: string,
  keywords = "",
): SearchIndexItem {
  return {
    id: `page-${id}`,
    type: "page",
    title,
    excerpt,
    href: `/${locale}${path}`,
    keywords,
  };
}

let searchIndexCache: { locale: Locale; items: SearchIndexItem[]; builtAt: number } | null =
  null;
const SEARCH_INDEX_TTL_MS = 5 * 60 * 1000;

export async function buildSearchIndex(locale: Locale): Promise<SearchIndexItem[]> {
  const now = Date.now();
  if (
    searchIndexCache &&
    searchIndexCache.locale === locale &&
    now - searchIndexCache.builtAt < SEARCH_INDEX_TTL_MS
  ) {
    return searchIndexCache.items;
  }

  const items = await buildSearchIndexUncached(locale);
  searchIndexCache = { locale, items, builtAt: now };
  return items;
}

async function buildSearchIndexUncached(locale: Locale): Promise<SearchIndexItem[]> {
  const items: SearchIndexItem[] = [];
  const [projects, galleries] = await Promise.all([getProjects(), fetchGalleries()]);

  items.push(
    pageItem(locale, "home", "Home", "Portfolio home", "", "home portfolio"),
    pageItem(
      locale,
      "projects",
      "Projects",
      "Web development projects",
      "/projects",
      "projects web development",
    ),
    pageItem(
      locale,
      "photography",
      "Photography",
      "Photo galleries",
      "/photography",
      "photography photos galleries",
    ),
    pageItem(
      locale,
      "photography-photos",
      seoCopy(locale, "allPhotosTitle"),
      seoCopy(locale, "allPhotosDescription"),
      "/photography/photos",
      "photography all photos pictures images browse",
    ),
  );

  for (const project of projects) {
    const title = project.name;
    const short = getLocalizedText(project.short_description, locale);
    const excerpt = (
      short || stripHtml(getLocalizedText(project.description, locale))
    ).slice(0, 200);
    items.push({
      id: `project-${project.id}`,
      type: "project",
      title,
      excerpt: excerpt || project.type,
      href: `/${locale}/projects/${project.id}`,
      keywords: [project.technology, project.type, title].join(" "),
    });
  }

  for (const gallery of galleries) {
    const title = localizedField(gallery.title, locale) || "Gallery";
    const description = localizedField(gallery.description, locale);
    const tags = (gallery.tags ?? []).join(" ");
    items.push({
      id: `gallery-${gallery.slug}`,
      type: "gallery",
      title,
      excerpt: description || gallery.location || "",
      href: `/${locale}/photography/${gallery.slug}`,
      keywords: [title, gallery.location, tags].filter(Boolean).join(" "),
    });
  }

  return items;
}
