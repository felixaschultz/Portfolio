import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import da from "./locales/da.json";
import de from "./locales/de.json";
import en from "./locales/en.json";

export const supportedLocales = ["da", "de", "en"] as const;
export type Locale = (typeof supportedLocales)[number];

export const defaultLocale: Locale = "da";

const resources = {
  da: { translation: da },
  de: { translation: de },
  en: { translation: en },
};

export function createI18n(locale: Locale) {
  const instance = i18n.createInstance();
  instance.use(initReactI18next).init({
    resources,
    lng: locale,
    fallbackLng: defaultLocale,
    interpolation: { escapeValue: false },
  });
  return instance;
}

export function isValidLocale(value: string): value is Locale {
  return supportedLocales.includes(value as Locale);
}

export function localizedField<T extends Record<string, string | undefined>>(
  field: T | undefined,
  locale: Locale,
): string {
  if (!field) return "";
  return field[locale] || field.da || field.en || field.de || "";
}

/** Sanity fields may be a plain string or a localized object (including legacy data). */
export function resolveSanityString(
  value: string | Record<string, string | undefined> | undefined | null,
  locale: Locale,
): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return localizedField(value, locale);
}
