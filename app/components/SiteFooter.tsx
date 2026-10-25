import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { type Locale } from "../lib/i18n";
import { Logo } from "./Logo";

type SiteFooterProps = {
  onContactClick: () => void;
};

function GithubIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LinkedinIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="2" y="9" width="4" height="12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function InstagramIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

const socialLinks = [
  { name: "GitHub", href: "https://github.com/felixaschultz", Icon: GithubIcon },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/felixaschultz/", Icon: LinkedinIcon },
  { name: "Instagram", href: "https://instagram.com/felixaschultz", Icon: InstagramIcon },
];

export function SiteFooter({ onContactClick }: SiteFooterProps) {
  const { locale } = useParams();
  const { t } = useTranslation();
  const lng = (locale ?? "da") as Locale;
  const base = `/${lng}`;
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <Logo />
          <p className="site-footer__tagline">{t("footer.tagline")}</p>
        </div>

        <nav className="site-footer__nav" aria-label="Footer">
          <Link to={`${base}/photography`}>{t("nav.photography")}</Link>
          <Link to={`${base}/projects`}>{t("nav.projects")}</Link>
          <button type="button" onClick={onContactClick}>
            {t("nav.contact")}
          </button>
        </nav>

        <div className="site-footer__social">
          {socialLinks.map(({ name, href, Icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={name}
              className="site-footer__social-link"
            >
              <Icon className="site-footer__social-icon" />
            </a>
          ))}
        </div>
      </div>

      <div className="site-footer__bottom">
        <p>
          © {year} Felix A. Schultz. {t("footer.rights")}.
        </p>
      </div>
    </footer>
  );
}
