import { defaultLocale, isValidLocale, type Locale } from "./i18n";

export const LOCALE_COOKIE = "portfolio_locale";

export function resolveShopLocale(request: Request): Locale {
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get("lang")?.trim().toLowerCase();
  if (fromQuery && isValidLocale(fromQuery)) return fromQuery;

  const cookie = readLocaleCookie(request.headers.get("Cookie"));
  if (cookie) return cookie;

  const referer = request.headers.get("Referer");
  if (referer) {
    try {
      const refPath = new URL(referer).pathname;
      const segment = refPath.split("/").filter(Boolean)[0];
      if (segment && isValidLocale(segment)) return segment;
    } catch {
      /* ignore */
    }
  }

  const accept = request.headers.get("Accept-Language");
  if (accept) {
    for (const part of accept.split(",")) {
      const code = part.split(";")[0]?.trim().slice(0, 2).toLowerCase();
      if (code && isValidLocale(code)) return code;
    }
  }

  return defaultLocale;
}

export function readLocaleCookie(cookieHeader: string | null): Locale | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]+)`));
  const value = match?.[1]?.trim().toLowerCase();
  return value && isValidLocale(value) ? value : null;
}

export function localeCookieHeader(locale: Locale): string {
  const maxAge = 60 * 60 * 24 * 365;
  return `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export function appendShopLang(path: string, locale: Locale): string {
  const [pathname, search = ""] = path.split("?");
  const params = new URLSearchParams(search);
  params.set("lang", locale);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
