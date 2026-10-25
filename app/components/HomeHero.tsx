import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import type { ResponsiveCoverImage } from "../lib/galleries";

type HomeHeroProps = {
  base: string;
  photoCover?: ResponsiveCoverImage | null;
};

export function HomeHero({ base, photoCover }: HomeHeroProps) {
  const { t } = useTranslation();

  return (
    <section className="home-hero" aria-labelledby="home-hero-heading">
      {photoCover ? (
        <img
          src={photoCover.src}
          srcSet={photoCover.srcSet}
          sizes={photoCover.sizes}
          alt=""
          className="home-hero__bg"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      ) : null}
      <div className="home-hero__shade" aria-hidden />
      <div className="home-hero__content">
        <p className="home-hero__eyebrow font-mono text-xs uppercase tracking-[0.2em]">{t("hero.name")}</p>
        <h1 id="home-hero-heading" className="home-hero__title font-display">
          {t("home.hero.heading")}
        </h1>
        <p className="home-hero__lede">{t("home.hero.lede")}</p>
        <Link to={`${base}/photography`} className="home-hero__cta">
          {t("home.hero.cta")} →
        </Link>
      </div>
    </section>
  );
}
