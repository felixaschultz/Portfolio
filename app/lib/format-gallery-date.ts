import type { Locale } from "./i18n";

const localeMap: Record<Locale, string> = {
  da: "da-DK",
  de: "de-DE",
  en: "en-GB",
};

export function formatGalleryDate(isoDate: string | undefined, locale: Locale): string {
  if (!isoDate) return "";
  const date = new Date(isoDate.includes("T") ? isoDate : `${isoDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat(localeMap[locale], {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
