import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { type Locale } from "../lib/i18n";

const websiteLinks = [
  { name: "devhelp.dk", href: "https://www.devhelp.dk" },
  { name: "Intastellar Solutions", href: "https://www.intastellarsolutions.com" },
  { name: "Intastellar Consents", href: "https://www.intastellarconsents.com" },
];

type SiteHeaderProps = {
  onContactClick: () => void;
  onSearchClick: () => void;
};

export function SiteHeader({ onContactClick, onSearchClick }: SiteHeaderProps) {
  const { locale } = useParams();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const base = `/${locale}`;
  const currentLocale = (locale ?? "da") as Locale;

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  function localeHref(next: Locale): string {
    const path = location.pathname.replace(`/${currentLocale}`, `/${next}`);
    return path || `/${next}`;
  }

  function openSearch() {
    setMenuOpen(false);
    onSearchClick();
  }

  function openContact() {
    setMenuOpen(false);
    onContactClick();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link to={base} className="flex min-h-11 min-w-11 shrink-0 items-center gap-3">
          <img src="/assets/felix-schultz-logo-icon.svg" alt="Felix Schultz" className="h-9 w-9" />
          <span className="hidden font-display text-sm font-semibold tracking-tight sm:inline">
            Felix A. Schultz
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex md:gap-2" aria-label="Main">
          <NavLink
            to={`${base}/projects`}
            className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
          >
            {t("nav.projects")}
          </NavLink>
          <NavLink
            to={`${base}/photography`}
            className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
          >
            {t("nav.photography")}
          </NavLink>

          <details className="relative">
            <summary className="nav-link cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              {t("nav.websites")}
            </summary>
            <div className="absolute right-0 z-50 mt-2 min-w-[220px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-2 shadow-xl">
              {websiteLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-lg px-3 py-2.5 text-sm text-[var(--color-muted)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-text)]"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </details>

          <button
            type="button"
            onClick={onSearchClick}
            className="btn-ghost gap-1.5 px-4"
            aria-label={t("search.open")}
          >
            <span>{t("search.open")}</span>
            <kbd className="hidden rounded border border-[var(--color-border)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-muted)] lg:inline">
              {t("search.shortcut")}
            </kbd>
          </button>

          <button type="button" onClick={onContactClick} className="btn-ghost px-4">
            {t("nav.contact")}
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 rounded-full border border-[var(--color-border)] p-0.5">
            {(["da", "de", "en"] as Locale[]).map((lng) => (
              <Link
                key={lng}
                to={localeHref(lng)}
                className={`flex min-h-9 min-w-9 items-center justify-center rounded-full text-xs font-medium uppercase transition ${
                  i18n.language === lng
                    ? "bg-[var(--color-accent)] text-[#0a0f0e]"
                    : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                {lng}
              </Link>
            ))}
          </div>

          <button
            type="button"
            className="btn-icon md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
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

      {menuOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <nav
            id="mobile-nav"
            className="relative z-50 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden"
            aria-label="Main"
          >
            <div className="flex flex-col gap-1">
              <NavLink
                to={`${base}/projects`}
                className={({ isActive }) =>
                  `nav-link-mobile ${isActive ? "nav-link-active" : ""}`
                }
              >
                {t("nav.projects")}
              </NavLink>
              <NavLink
                to={`${base}/photography`}
                className={({ isActive }) =>
                  `nav-link-mobile ${isActive ? "nav-link-active" : ""}`
                }
              >
                {t("nav.photography")}
              </NavLink>
              <p className="mt-3 px-3 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                {t("nav.websites")}
              </p>
              {websiteLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="nav-link-mobile"
                >
                  {link.name}
                </a>
              ))}
              <button type="button" onClick={openSearch} className="nav-link-mobile text-left">
                {t("search.open")}
              </button>
              <button type="button" onClick={openContact} className="btn-primary mt-3 w-full">
                {t("nav.contact")}
              </button>
            </div>
          </nav>
        </>
      ) : null}
    </header>
  );
}
