import type { Locale } from "./i18n";

const localeMap: Record<Locale, string> = {
  da: "da-DK",
  de: "de-DE",
  en: "en-GB",
};

function parseGalleryDate(isoDate: string): Date {
  if (isoDate.includes("T")) return new Date(isoDate);
  return new Date(`${isoDate}T12:00:00.000Z`);
}

export function formatGalleryDate(isoDate: string | undefined, locale: Locale): string {
  if (!isoDate) return "";
  const date = parseGalleryDate(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat(localeMap[locale], {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}
