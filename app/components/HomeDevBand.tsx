import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { siteCompanyLinks } from "../lib/site-links";

type HomeDevBandProps = {
  base: string;
  onContact: () => void;
};

export function HomeDevBand({ base, onContact }: HomeDevBandProps) {
  const { t } = useTranslation();

  return (
    <section className="home-dev-band" aria-labelledby="home-dev-band-heading">
      <div className="home-dev-band__inner">
        <div className="home-dev-band__copy">
          <h2 id="home-dev-band-heading" className="home-dev-band__title font-display">
            {t("home.devBand.title")}
          </h2>
          <p className="home-dev-band__text">{t("home.devBand.text")}</p>
          <Link to={`${base}/projects`} className="home-dev-band__cta">
            {t("home.devBand.cta")} →
          </Link>
        </div>
        <div className="home-dev-band__links">
          <p className="home-dev-band__note">{t("home.devBand.note")}</p>
          <ul className="home-dev-band__list">
            {siteCompanyLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="home-dev-band__contact"
            onClick={(e) => {
              e.preventDefault();
              onContact();
            }}
          >
            {t("hero.cta")}
          </button>
        </div>
      </div>
    </section>
  );
}
