import { useTranslation } from "react-i18next";
import type { GalleryListItem } from "../lib/galleries";
import { GalleryGrid } from "./GalleryGrid";
import { Reveal } from "./Reveal";

type PhotographyOverviewProps = {
  galleries: GalleryListItem[];
  activeTag?: string | null;
};

export function PhotographyOverview({ galleries, activeTag = null }: PhotographyOverviewProps) {
  const { t } = useTranslation();

  return (
    <div className="gallery-overview">
      <Reveal as="header" className="gallery-overview__header" variant="fade" immediate>
        <h1 className="gallery-overview__title">{t("photography.title")}</h1>
        <p className="gallery-overview__lede">{t("photography.description")}</p>
      </Reveal>
      <GalleryGrid galleries={galleries} activeTag={activeTag} />
    </div>
  );
}
