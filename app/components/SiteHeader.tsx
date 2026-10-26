import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useLocation, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useBodyScrollLock } from "../lib/useBodyScrollLock";
import { useScrolled } from "../lib/use-scrolled";
import { type Locale } from "../lib/i18n";
import { crossDomainUrl, localizedPath, pathSuffixAfterLocale, siteOriginForLocale } from "../lib/site-domains";
import { Logo } from "./Logo";

type SiteHeaderProps = {
  onSearchClick: () => void;
};

export function SiteHeader({ onSearchClick }: SiteHeaderProps) {
  const { locale } = useParams();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scrolled = useScrolled();
  const base = `/${locale}`;
  const currentLocale = (locale ?? "da") as Locale;

  useBodyScrollLock(menuOpen);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  function localeHref(next: Locale): string {
    const suffix = pathSuffixAfterLocale(location.pathname);
    if (isCrossDomainLocale(next)) {
      return crossDomainUrl(next, `/${currentLocale}${suffix}`, location.search);
    }
    return `${localizedPath(next, suffix)}${location.search}`;
  }

  function isCrossDomainLocale(next: Locale): boolean {
    if (typeof window === "undefined") {
      return siteOriginForLocale(next) !== siteOriginForLocale(currentLocale);
    }
    return siteOriginForLocale(next) !== window.location.origin.replace(/\/$/, "");
  }

  function openSearch() {
    setMenuOpen(false);
    onSearchClick();
  }

  return (
    <header
      className={`site-header ${scrolled ? "site-header--scrolled" : ""}`.trim()}
    >
      <div className="site-header__inner">
        <Logo className="min-h-10 shrink-0" />

        <nav className="header-nav-desktop" aria-label="Main">
          <NavLink
            to={`${base}/photography`}
            className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
          >
            {t("nav.photography")}
          </NavLink>
          <NavLink
            to={`${base}/projects`}
            className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
          >
            {t("nav.projects")}
          </NavLink>
          <NavLink
            to={`${base}/about`}
            className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
          >
            {t("nav.about")}
          </NavLink>

          <Link to={`${base}/contact`} className="btn-primary header-contact-button ml-3 px-5">
            {t("nav.contact")}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSearchClick}
            className="btn-icon header-search-button"
            aria-label={t("search.open")}
            title={`${t("search.open")} (${t("search.shortcut")})`}
          >
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden>
              <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9 9l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          <div className="flex items-center gap-0.5 rounded-full border border-[var(--color-border)] p-0.5">
            {(["da", "de", "en"] as Locale[]).map((lng) => {
              const href = localeHref(lng);
              const active = i18n.language === lng;
              const className = `flex min-h-9 min-w-9 items-center justify-center rounded-full text-xs font-medium uppercase transition ${
                active
                  ? "bg-[var(--color-accent)] text-[var(--color-bg)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
              }`;
              return isCrossDomainLocale(lng) ? (
                <a key={lng} href={href} className={className} hrefLang={lng}>
                  {lng}
                </a>
              ) : (
                <Link key={lng} to={href} className={className} hrefLang={lng}>
                  {lng}
                </Link>
              );
            })}
          </div>

          <button
            type="button"
            className="header-menu-button btn-icon"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && mounted
        ? createPortal(
            <div id="mobile-nav" className="fixed inset-0 z-[9998] lg:hidden">
              <button
                type="button"
                className="absolute inset-0 bg-black/60"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              />
              <nav
                className="absolute inset-x-0 top-[var(--site-header-height)] z-10 max-h-[calc(100dvh-var(--site-header-height))] overflow-y-auto border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_24px_64px_rgb(0_0_0_/_0.5)]"
                aria-label="Main"
              >
            <div className="flex flex-col gap-1">
              <NavLink
                to={`${base}/photography`}
                className={({ isActive }) =>
                  `nav-link-mobile ${isActive ? "nav-link-active" : ""}`
                }
                onClick={() => setMenuOpen(false)}
              >
                {t("nav.photography")}
              </NavLink>
              <NavLink
                to={`${base}/projects`}
                className={({ isActive }) =>
                  `nav-link-mobile ${isActive ? "nav-link-active" : ""}`
                }
                onClick={() => setMenuOpen(false)}
              >
                {t("nav.projects")}
              </NavLink>
              <NavLink
                to={`${base}/about`}
                className={({ isActive }) =>
                  `nav-link-mobile ${isActive ? "nav-link-active" : ""}`
                }
                onClick={() => setMenuOpen(false)}
              >
                {t("nav.about")}
              </NavLink>
              <button type="button" onClick={openSearch} className="nav-link-mobile text-left">
                {t("search.open")}
              </button>
              <Link
                to={`${base}/contact`}
                className="btn-primary mt-3 w-full"
                onClick={() => setMenuOpen(false)}
              >
                {t("nav.contact")}
              </Link>
                </div>
              </nav>
            </div>,
            document.body,
          )
        : null}
    </header>
  );
}
