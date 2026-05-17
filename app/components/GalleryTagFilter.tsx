import { useTranslation } from "react-i18next";
import { tagToParam } from "../lib/gallery-tags";

type GalleryTagFilterProps = {
  tags: string[];
  activeTag: string | null;
  onSelect: (tag: string | null) => void;
};

export function GalleryTagFilter({ tags, activeTag, onSelect }: GalleryTagFilterProps) {
  const { t } = useTranslation();

  if (tags.length === 0) return null;

  return (
    <nav
      className="gallery-overview__filter"
      role="group"
      aria-label={t("photography.filterLabel")}
    >
      <div className="gallery-overview__filter-inner">
        <span className="gallery-overview__filter-label">{t("photography.filterLabel")}</span>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`gallery-overview__filter-btn ${activeTag === null ? "gallery-overview__filter-btn--active" : ""}`}
          aria-pressed={activeTag === null}
        >
          {t("photography.filterAll")}
        </button>
        {tags.map((tag) => {
          const selected = activeTag !== null && tagToParam(activeTag) === tagToParam(tag);
          return (
            <span key={tagToParam(tag)} className="contents">
              <span className="gallery-overview__filter-sep" aria-hidden>
                /
              </span>
              <button
                type="button"
                onClick={() => onSelect(tag)}
                className={`gallery-overview__filter-btn ${selected ? "gallery-overview__filter-btn--active" : ""}`}
                aria-pressed={selected}
              >
                {tag}
              </button>
            </span>
          );
        })}
      </div>
    </nav>
  );
}
