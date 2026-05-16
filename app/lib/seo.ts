import { defaultLocale, supportedLocales, type Locale } from "./i18n";

export const SITE_NAME = "Felix A. Schultz";
export const DEFAULT_OG_IMAGE = "/assets/me.jpg";

export function getSiteUrl(): string {
  const url =
    (typeof process !== "undefined" && process.env.SITE_URL) ||
    "https://www.felix-schultz.dk";
  return url.replace(/\/$/, "");
}

export function pageUrl(locale: Locale, path = ""): string {
  const normalized = path.startsWith("/") ? path : path ? `/${path}` : "";
  return `${getSiteUrl()}/${locale}${normalized}`;
}

export type PageMetaInput = {
  title: string;
  description: string;
  locale: Locale;
  /** Path after locale, e.g. `/projects/foo` or `` for home */
  path?: string;
  image?: string;
  /** Set false on error pages */
  indexable?: boolean;
};

function absoluteImage(image: string): string {
  if (image.startsWith("http")) return image;
  return `${getSiteUrl()}${image.startsWith("/") ? image : `/${image}`}`;
}

function fullTitle(title: string): string {
  if (title.includes(SITE_NAME)) return title;
  return `${title} | ${SITE_NAME}`;
}

/** Path used for hreflang alternates (same across locales), e.g. `/projects/cykelfaergen` */
export function hreflangLinks(path = ""): Array<{
  tagName: "link";
  rel: "alternate";
  hrefLang: string;
  href: string;
}> {
  const normalized = path.startsWith("/") ? path : path ? `/${path}` : "";
  return supportedLocales.map((locale) => ({
    tagName: "link" as const,
    rel: "alternate" as const,
    hrefLang: locale,
    href: pageUrl(locale, normalized),
  }));
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
    href: pageUrl(defaultLocale, normalized),
  };
}

export function buildPageMeta({
  title,
  description,
  locale,
  path = "",
  image = DEFAULT_OG_IMAGE,
  indexable = true,
}: PageMetaInput) {
  const normalized = path.startsWith("/") ? path : path ? `/${path}` : "";
  const url = pageUrl(locale, normalized);
  const ogImage = absoluteImage(image);
  const pageTitle = fullTitle(title);

  return [
    { title: pageTitle },
    { name: "description", content: description },
    { name: "robots", content: indexable ? "index, follow" : "noindex, nofollow" },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: pageTitle },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: ogImage },
    { property: "og:locale", content: ogLocale(locale) },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: pageTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
    { tagName: "link", rel: "canonical", href: url },
    ...hreflangLinks(normalized),
    xDefaultHref(normalized),
  ];
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
