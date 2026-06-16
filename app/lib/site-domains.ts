import { defaultLocale, supportedLocales, type Locale } from "./i18n";

const DANISH_HOSTS = new Set(["felix-schultz.dk", "www.felix-schultz.dk"]);
const NET_HOSTS = new Set(["felix-schultz.net", "www.felix-schultz.net"]);

/** BCP 47 tags for `<html lang>` and hreflang. */
export const HTML_LANG: Record<Locale, string> = {
  da: "da-DK",
  en: "en-US",
  de: "de-DE",
};

/** Short + regional hreflang values per locale (Google accepts both). */
export const HREFLANG_TAGS: Record<Locale, readonly string[]> = {
  da: ["da", "da-DK"],
  en: ["en", "en-US"],
  de: ["de", "de-DE"],
};

export function normalizeHostname(hostname: string): string {
  return hostname.trim().toLowerCase().replace(/\.$/, "");
}

export function isDanishHost(hostname: string): boolean {
  return DANISH_HOSTS.has(normalizeHostname(hostname));
}

export function isNetHost(hostname: string): boolean {
  return NET_HOSTS.has(normalizeHostname(hostname));
}

/** Production hosts enforce locale ↔ domain rules; localhost allows all locales. */
export function shouldEnforceDomainLocale(hostname: string): boolean {
  return isDanishHost(hostname) || isNetHost(hostname);
}

/** Default locale when visiting `/` on a known production host. */
export function defaultLocaleForHost(hostname: string): Locale | null {
  if (isDanishHost(hostname)) return "da";
  if (isNetHost(hostname)) return "en";
  return null;
}

/** Canonical origin for a locale (da → .dk, en/de → .net). */
export function siteOriginForLocale(locale: Locale): string {
  if (locale === "da") {
    const fromEnv =
      (typeof process !== "undefined" && process.env.SITE_URL_DK) ||
      "https://www.felix-schultz.dk";
    return fromEnv.replace(/\/$/, "");
  }
  const fromEnv =
    (typeof process !== "undefined" && process.env.SITE_URL) ||
    "https://www.felix-schultz.net";
  return fromEnv.replace(/\/$/, "");
}

export function localesForSitemap(hostname: string): Locale[] {
  if (isDanishHost(hostname)) return ["da"];
  if (isNetHost(hostname)) return ["en", "de"];
  return [...supportedLocales];
}

export function localeAllowedOnHost(locale: Locale, hostname: string): boolean {
  if (!shouldEnforceDomainLocale(hostname)) return true;
  if (isDanishHost(hostname)) return locale === "da";
  return locale === "en" || locale === "de";
}

export function localizedPath(locale: Locale, suffix = ""): string {
  const normalized = suffix.startsWith("/") ? suffix : suffix ? `/${suffix}` : "";
  return `/${locale}${normalized}`;
}

/** Path after the locale segment, e.g. `/da/photography/x` → `/photography/x`. */
export function pathSuffixAfterLocale(pathname: string): string {
  const match = pathname.match(/^\/(da|de|en)(\/.*)?$/);
  return match ? (match[2] ?? "") : pathname;
}

export function crossDomainUrl(locale: Locale, pathname: string, search = ""): string {
  const suffix = pathSuffixAfterLocale(pathname);
  return `${siteOriginForLocale(locale)}${localizedPath(locale, suffix)}${search}`;
}

export function resolveEntryLocale(hostname: string): Locale {
  return defaultLocaleForHost(hostname) ?? defaultLocale;
}
