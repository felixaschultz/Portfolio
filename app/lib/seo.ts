import { defaultLocale, supportedLocales, type Locale } from "./i18n";
import {
  HREFLANG_TAGS,
  siteOriginForLocale,
} from "./site-domains";

export const SITE_NAME = "Felix A. Schultz";
export const DEFAULT_OG_IMAGE = "/assets/me.jpg";

export function getSiteUrl(): string {
  const url =
    (typeof process !== "undefined" && process.env.SITE_URL) ||
    "https://www.felix-schultz.net";
  return url.replace(/\/$/, "");
}

/** Request origin for sitemap, robots, shop links. */
export function resolveSiteUrl(request: Request): string {
  return new URL(request.url).origin.replace(/\/$/, "");
}

export function shopGalleryPath(shopToken: string): string {
  return `/shop/gallery/${encodeURIComponent(shopToken)}`;
}

export function pageUrlForSite(siteUrl: string, locale: Locale, path = ""): string {
  const normalized = path.startsWith("/") ? path : path ? `/${path}` : "";
  const base = siteUrl.replace(/\/$/, "");
  return `${base}/${locale}${normalized}`;
}

/** Canonical public URL for a locale (uses domain mapping: da → .dk, en/de → .net). */
export function pageUrl(locale: Locale, path = ""): string {
  return pageUrlForSite(siteOriginForLocale(locale), locale, path);
}

export type PageMetaInput = {
  title: string;
  description: string;
  locale: Locale;
  /** Path after locale, e.g. `/projects/foo` or `` for home */
  path?: string;
  image?: string;
  /** og:title / twitter:title; defaults to document title with site name */
  ogTitle?: string;
  imageAlt?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  /** Set false on error pages */
  indexable?: boolean;
};

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

function absoluteImage(image: string, siteUrl: string): string {
  if (image.startsWith("http")) return image;
  const base = siteUrl.replace(/\/$/, "");
  return `${base}${image.startsWith("/") ? image : `/${image}`}`;
}

function fullTitle(title: string): string {
  if (title.includes(SITE_NAME)) return title;
  return `${title} | ${SITE_NAME}`;
}

/** Cross-domain hreflang alternates (da on .dk, en/de on .net). */
export function hreflangLinks(path = ""): Array<{
  tagName: "link";
  rel: "alternate";
  hrefLang: string;
  href: string;
}> {
  const normalized = path.startsWith("/") ? path : path ? `/${path}` : "";
  const links: Array<{
    tagName: "link";
    rel: "alternate";
    hrefLang: string;
    href: string;
  }> = [];

  for (const locale of supportedLocales) {
    const href = pageUrlForSite(siteOriginForLocale(locale), locale, normalized);
    for (const hrefLang of HREFLANG_TAGS[locale]) {
      links.push({
        tagName: "link",
        rel: "alternate",
        hrefLang,
        href,
      });
    }
  }

  return links;
}

export function xDefaultHref(path = ""): {
  tagName: "link";
  rel: "alternate";
  hrefLang: "x-default";
  href: string;
} {
  const normalized = path.startsWith("/") ? path : path ? `/${path}` : "";
  return {
    tagName: "link",
    rel: "alternate",
    hrefLang: "x-default",
    href: pageUrlForSite(siteOriginForLocale("en"), "en", normalized),
  };
}

export function buildPageMeta({
  title,
  description,
  locale,
  path = "",
  image = DEFAULT_OG_IMAGE,
  ogTitle,
  imageAlt,
  ogImageWidth = OG_IMAGE_WIDTH,
  ogImageHeight = OG_IMAGE_HEIGHT,
  indexable = true,
}: PageMetaInput) {
  const normalized = path.startsWith("/") ? path : path ? `/${path}` : "";
  const canonicalOrigin = siteOriginForLocale(locale);
  const url = pageUrlForSite(canonicalOrigin, locale, normalized);
  const ogImage = absoluteImage(image, canonicalOrigin);
  const pageTitle = fullTitle(title);
  const socialTitle = ogTitle ?? pageTitle;

  return [
    { title: pageTitle },
    { name: "description", content: description },
    { name: "robots", content: indexable ? "index, follow" : "noindex, nofollow" },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: socialTitle },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: ogImage },
    { property: "og:image:width", content: String(ogImageWidth) },
    { property: "og:image:height", content: String(ogImageHeight) },
    ...(imageAlt ? [{ property: "og:image:alt", content: imageAlt }] : []),
    { property: "og:locale", content: ogLocale(locale) },
    ...ogLocaleAlternates(locale),
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: socialTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
    ...(imageAlt ? [{ name: "twitter:image:alt", content: imageAlt }] : []),
    { tagName: "link", rel: "canonical", href: url },
    ...hreflangLinks(normalized),
    xDefaultHref(normalized),
  ];
}

function ogLocaleAlternates(current: Locale): Array<{ property: string; content: string }> {
  return supportedLocales
    .filter((locale) => locale !== current)
    .map((locale) => ({ property: "og:locale:alternate", content: ogLocale(locale) }));
}

function ogLocale(locale: Locale): string {
  const map: Record<Locale, string> = {
    da: "da_DK",
    de: "de_DE",
    en: "en_US",
  };
  return map[locale];
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}
