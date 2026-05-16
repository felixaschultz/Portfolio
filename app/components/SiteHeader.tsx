import { Link, NavLink, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { Locale } from "../lib/i18n";

const websiteLinks = [
  { name: "devhelp.dk", href: "https://www.devhelp.dk" },
  { name: "Intastellar Solutions", href: "https://www.intastellarsolutions.com" },
  { name: "Intastellar Consents", href: "https://www.intastellarconsents.com" },
];

type SiteHeaderProps = {
  onContactClick: () => void;
};

export function SiteHeader({ onContactClick }: SiteHeaderProps) {
  const { locale } = useParams();
  const { t, i18n } = useTranslation();
  const base = `/${locale}`;

  const switchLocale = (next: Locale) => {
    const path = window.location.pathname.replace(`/${locale}`, `/${next}`);
    window.location.href = path || `/${next}`;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link to={base} className="flex items-center gap-3">
          <img src="/assets/felix-schultz-logo-icon.svg" alt="Felix Schultz" className="h-9 w-9" />
          <span className="hidden font-display text-sm font-semibold tracking-tight sm:inline">
            Felix A. Schultz
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <NavLink
            to={`${base}/projects`}
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : ""}`
            }
          >
            {t("nav.projects")}
          </NavLink>
          <NavLink
            to={`${base}/photography`}
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link-active" : ""}`
            }
          >
            {t("nav.photography")}
          </NavLink>

          <details className="relative hidden md:block">
            <summary className="nav-link cursor-pointer list-none">
              {t("nav.websites")}
            </summary>
            <div className="absolute right-0 mt-2 min-w-[220px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-2 shadow-xl">
              {websiteLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-lg px-3 py-2 text-sm text-[var(--color-muted)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-text)]"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </details>

          <button type="button" onClick={onContactClick} className="btn-ghost hidden sm:inline-flex">
            {t("nav.contact")}
          </button>

          <div className="ml-1 flex items-center gap-1 rounded-full border border-[var(--color-border)] p-1">
            {(["da", "de", "en"] as Locale[]).map((lng) => (
              <button
                key={lng}
                type="button"
                onClick={() => switchLocale(lng)}
                className={`rounded-full px-2 py-1 text-xs font-medium uppercase transition ${
                  i18n.language === lng
                    ? "bg-[var(--color-accent)] text-white"
                    : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                {lng}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
