import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import type { ResponsiveCoverImage } from "../lib/galleries";

const companyLinks = [
  { name: "devhelp.dk", href: "https://www.devhelp.dk" },
  { name: "Intastellar Solutions", href: "https://www.intastellarsolutions.com" },
  { name: "Intastellar Consents", href: "https://www.intastellarconsents.com" },
];

type HomeDoorsProps = {
  base: string;
  photoCover?: ResponsiveCoverImage | null;
  devCover?: Pick<ResponsiveCoverImage, "src" | "srcSet" | "sizes"> | null;
  onContact: () => void;
};

export function HomeDoors({ base, photoCover, devCover, onContact }: HomeDoorsProps) {
  const { t } = useTranslation();

  return (
    <section className="home-doors" aria-labelledby="home-doors-heading">
      <header className="home-doors__intro">
        <div className="home-doors__intro-inner">
          <div className="home-doors__intro-copy">
            <p className="home-doors__eyebrow font-mono text-sm text-[var(--color-accent)]">
              &lt;{t("hero.name")} /&gt;
            </p>
            <h1 id="home-doors-heading" className="home-doors__title font-display">
              {t("home.doors.heading")}
            </h1>
          </div>
          <p className="home-doors__lede">{t("home.doors.lede")}</p>
        </div>
        <div className="home-doors__intro-paths" aria-hidden>
          <span className="home-doors__intro-path home-doors__intro-path--photo">
            {t("home.doors.photoTitle")}
          </span>
          <span className="home-doors__intro-path home-doors__intro-path--dev">
            {t("home.doors.devTitle")}
          </span>
        </div>
      </header>

      <div className="home-doors__grid">
        <Link
          to={`${base}/photography`}
          className="home-doors__panel home-doors__panel--photo group"
        >
          {photoCover ? (
            <img
              src={photoCover.src}
              srcSet={photoCover.srcSet}
              sizes={photoCover.sizes}
              alt=""
              className="home-doors__panel-bg"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          ) : null}
          <div className="home-doors__panel-shade" aria-hidden />
          <div className="home-doors__panel-content">
            <h2 className="home-doors__panel-title">{t("home.doors.photoTitle")}</h2>
            <p className="home-doors__panel-text">{t("home.doors.photoText")}</p>
            <span className="home-doors__panel-cta">{t("home.doors.photoCta")} →</span>
          </div>
        </Link>

        <div className="home-doors__panel home-doors__panel--dev group">
          {devCover ? (
            <img
              src={devCover.src}
              srcSet={devCover.srcSet}
              sizes={devCover.sizes}
              alt=""
              className="home-doors__panel-bg"
              loading="lazy"
              decoding="async"
            />
          ) : null}
          <div className="home-doors__panel-shade home-doors__panel-shade--dev" aria-hidden />
          <div className="home-doors__panel-content">
            <h2 className="home-doors__panel-title">{t("home.doors.devTitle")}</h2>
            <p className="home-doors__panel-text">{t("home.doors.devText")}</p>
            <Link to={`${base}/projects`} className="home-doors__panel-cta home-doors__panel-cta--link">
              {t("home.doors.devCta")} →
            </Link>
            <p className="home-doors__dev-note">{t("home.doors.devNote")}</p>
            <ul className="home-doors__dev-links">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="home-doors__dev-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="home-doors__contact"
              onClick={(e) => {
                e.preventDefault();
                onContact();
              }}
            >
              {t("hero.cta")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
