import type { Locale } from "./i18n";
import da from "./i18n/locales/da.json";
import de from "./i18n/locales/de.json";
import en from "./i18n/locales/en.json";

const copies = { da, de, en } as const;

export function legalCopy<K extends "imprint" | "privacy" | "terms">(
  locale: Locale,
  key: K,
): (typeof copies)["en"][K] {
  return copies[locale][key] as (typeof copies)["en"][K];
}
