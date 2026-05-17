import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { GalleryListItem } from "../lib/galleries";
import { GalleryGrid } from "./GalleryGrid";
import { Reveal } from "./Reveal";

type PhotographyOverviewProps = {
  galleries: GalleryListItem[];
  activeTag?: string | null;
  activeCategorySlug?: string | null;
};

export function PhotographyOverview({
  galleries,
  activeTag = null,
  activeCategorySlug = null,
}: PhotographyOverviewProps) {
  const { locale } = useParams();
  const { t } = useTranslation();
  const base = `/${locale}`;

  return (
    <div className="gallery-overview">
      <Reveal as="header" className="gallery-overview__header" variant="fade" immediate>
        <h1 className="gallery-overview__title">{t("photography.title")}</h1>
        <p className="gallery-overview__lede">{t("photography.description")}</p>
        <p className="mt-8">
          <Link to={`${base}/photography/photos`} className="btn-primary text-sm">
            {t("photography.browseAllPhotos")} →
          </Link>
        </p>
      </Reveal>
      <GalleryGrid
        galleries={galleries}
        activeTag={activeTag}
        activeCategorySlug={activeCategorySlug}
      />
    </div>
  );
}
