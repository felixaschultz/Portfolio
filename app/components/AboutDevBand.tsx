import { Link } from "react-router";
import { useTranslation } from "react-i18next";

const STACK = ["TypeScript", "React Router", "Sanity CMS", "Tailwind CSS", "Stripe", "Flickr API"];

type AboutDevBandProps = {
  base: string;
};

export function AboutDevBand({ base }: AboutDevBandProps) {
  const { t } = useTranslation();

  return (
    <section className="home-dev-band" aria-labelledby="about-dev-band-heading">
      <div className="home-dev-band__inner">
        <div className="home-dev-band__copy">
          <h2 id="about-dev-band-heading" className="home-dev-band__title font-display">
            {t("about.devBand.title")}
          </h2>
          <p className="home-dev-band__text">{t("about.devBand.text")}</p>
          <Link to={`${base}/projects`} className="home-dev-band__cta">
            {t("about.devBand.cta")} →
          </Link>
        </div>
        <div className="home-dev-band__links">
          <p className="home-dev-band__note">{t("about.devBand.stackLabel")}</p>
          <ul className="tech-chips">
            {STACK.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
