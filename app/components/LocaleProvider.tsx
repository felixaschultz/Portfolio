import { I18nextProvider } from "react-i18next";
import { createI18n, type Locale } from "../lib/i18n";

type LocaleProviderProps = {
  locale: Locale;
  children: React.ReactNode;
};

export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  const i18n = createI18n(locale);
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
