import type { ReactNode } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import type { Locale } from "../lib/i18n";
import { LogoMark } from "./LogoMark";
import { SITE_NAME } from "../lib/seo";
import { ShopLocaleSwitcher } from "./ShopLocaleSwitcher";

type ShopPortalShellProps = {
  children: ReactNode;
  locale: Locale;
  /** e.g. "wide" for the photo grid page */
  mainClassName?: string;
};

export function ShopPortalShell({ children, locale, mainClassName = "" }: ShopPortalShellProps) {
  const { t } = useTranslation();

  return (
    <div className="customer-portal">
      <header className="shop-portal-header">
        <Link to={`/${locale}`} className="shop-portal-header__brand">
          <LogoMark className="shop-portal-header__mark" />
          <span className="shop-portal-header__name">{SITE_NAME}</span>
        </Link>
        <div className="shop-portal-header__end">
          <span className="shop-portal-header__badge">{t("shop.badge")}</span>
          <ShopLocaleSwitcher locale={locale} />
        </div>
      </header>
      <main
        className={`customer-portal__main${mainClassName ? ` ${mainClassName}` : ""}`.trim()}
      >
        {children}
      </main>
    </div>
  );
}
