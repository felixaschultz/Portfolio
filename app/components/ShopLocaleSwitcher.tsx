import { Link, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { supportedLocales, type Locale } from "../lib/i18n";

export function ShopLocaleSwitcher({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const location = useLocation();

  function hrefFor(next: Locale) {
    const params = new URLSearchParams(location.search);
    params.set("lang", next);
    const query = params.toString();
    return query ? `${location.pathname}?${query}` : location.pathname;
  }

  return (
    <nav className="shop-locale-switcher" aria-label={t("shop.languageNav")}>
      {supportedLocales.map((lng) => (
        <Link
          key={lng}
          to={hrefFor(lng)}
          className={`shop-locale-switcher__btn${lng === locale ? " shop-locale-switcher__btn--active" : ""}`}
          aria-current={lng === locale ? "true" : undefined}
        >
          {lng.toUpperCase()}
        </Link>
      ))}
    </nav>
  );
}
