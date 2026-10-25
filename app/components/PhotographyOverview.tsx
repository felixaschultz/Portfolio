import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { GalleryListItem } from "../lib/galleries";
import type { GalleryCategoryRef } from "../lib/sanity.server";
import { GalleryGrid } from "./GalleryGrid";
import { Reveal } from "./Reveal";

type PhotographyOverviewProps = {
  galleries: GalleryListItem[];
  publishedCategories?: GalleryCategoryRef[];
  currentYear?: number;
  activeTag?: string | null;
  activeCategorySlug?: string | null;
  categoryLabel?: string | null;
  categoryDescription?: string | null;
};

export function PhotographyOverview({
  galleries,
  publishedCategories = [],
  currentYear,
  activeTag = null,
  activeCategorySlug = null,
  categoryLabel = null,
  categoryDescription = null,
}: PhotographyOverviewProps) {
  const { locale } = useParams();
  const { t } = useTranslation();
  const base = `/${locale}`;

  const heroTitle = categoryLabel ?? activeTag ?? t("photography.title");
  const heroLede = categoryDescription ?? t("photography.description");
  const heroGallery = galleries[0] ?? null;

  return (
    <div className="gallery-overview">
      {heroGallery ? (
        <section className="home-hero" aria-labelledby="gallery-overview-hero-heading">
          <img
            src={heroGallery.coverUrl}
            srcSet={heroGallery.coverSrcSet}
            sizes="100vw"
            alt=""
            className="home-hero__bg"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          <div className="home-hero__shade" aria-hidden />
          <div className="home-hero__content">
            <h1 id="gallery-overview-hero-heading" className="home-hero__title font-display">
              {heroTitle}
            </h1>
            <p className="home-hero__lede">{heroLede}</p>
            <Link to={`${base}/photography/photos`} className="home-hero__cta">
              {t("photography.browseAllPhotos")} →
            </Link>
          </div>
        </section>
      ) : (
        <Reveal as="header" className="gallery-overview__header" variant="fade" immediate>
          <h1 className="gallery-overview__title">{heroTitle}</h1>
          <p className="gallery-overview__lede">{heroLede}</p>
          <p className="mt-8">
            <Link to={`${base}/photography/photos`} className="gallery-overview__photos-link">
              {t("photography.browseAllPhotos")} →
            </Link>
          </p>
        </Reveal>
      )}
      <GalleryGrid
        galleries={galleries}
        publishedCategories={publishedCategories}
        currentYear={currentYear}
        activeTag={activeTag}
        activeCategorySlug={activeCategorySlug}
      />
    </div>
  );
}
