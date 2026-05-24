import { useEffect, useMemo } from "react";
import { I18nextProvider } from "react-i18next";
import { createI18n, type Locale } from "../lib/i18n";
import { localeCookieHeader } from "../lib/shop-locale";

type LocaleProviderProps = {
  locale: Locale;
  children: React.ReactNode;
};

export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  const i18n = useMemo(() => createI18n(locale), []);

  useEffect(() => {
    void i18n.changeLanguage(locale);
    document.documentElement.lang = locale;
    document.cookie = localeCookieHeader(locale);
  }, [locale, i18n]);

  return (
    <I18nextProvider key={locale} i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}
