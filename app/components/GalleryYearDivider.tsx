import { useTranslation } from "react-i18next";

type GalleryYearDividerProps = {
  year: number;
};

export function GalleryYearDivider({ year }: GalleryYearDividerProps) {
  const { t } = useTranslation();

  return (
    <div
      className="gallery-overview__year-break"
      role="separator"
      aria-label={t("photography.yearSection", { year })}
    >
      <span className="gallery-overview__year-break-line" aria-hidden />
      <span className="gallery-overview__year-label">{year}</span>
      <span className="gallery-overview__year-break-line" aria-hidden />
    </div>
  );
}
