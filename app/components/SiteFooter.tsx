import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { type Locale } from "../lib/i18n";
import { Logo } from "./Logo";
import { socialLinks } from "./SocialIcons";

export function SiteFooter() {
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
          <Link to={`${base}/about`}>{t("nav.about")}</Link>
          <Link to={`${base}/contact`}>{t("nav.contact")}</Link>
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
        <div className="site-footer__bottom-inner">
          <p>
            © {year} Felix A. Schultz. {t("footer.rights")}.
          </p>
          <a
            href="https://www.intastellarsolutions.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Intastellar Solutions"
            className="site-footer__company-mark"
          >
            <img
              src="https://www.intastellar-consents.com/assets/icons/intastellar-logo-white.svg"
              alt="Intastellar"
              loading="lazy"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
