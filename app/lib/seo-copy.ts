import type { Locale } from "./i18n";
import da from "./i18n/locales/da.json";
import de from "./i18n/locales/de.json";
import en from "./i18n/locales/en.json";

const copies = { da, de, en } as const;

export function seoCopy(locale: Locale, key: keyof (typeof en)["seo"]): string {
  return copies[locale].seo[key];
}
