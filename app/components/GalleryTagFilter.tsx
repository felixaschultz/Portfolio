import { NavLink, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { photographyTagPath, tagToParam } from "../lib/gallery-tags";

type GalleryTagFilterProps = {
  tags: string[];
  /** Defaults to gallery index tag URLs */
  resolveTagPath?: (locale: string, tag: string | null) => string;
};

function filterLinkClass({ isActive }: { isActive: boolean }): string {
  return `gallery-overview__filter-btn ${isActive ? "gallery-overview__filter-btn--active" : ""}`;
}

export function GalleryTagFilter({ tags, resolveTagPath = photographyTagPath }: GalleryTagFilterProps) {
  const { locale } = useParams();
  const { t } = useTranslation();
  const lng = locale ?? "da";
  const tagPath = (tag: string | null) => resolveTagPath(lng, tag);

  if (tags.length === 0) return null;

  return (
    <nav
      className="gallery-overview__filter"
      role="group"
      aria-label={t("photography.filterLabel")}
    >
      <div className="gallery-overview__filter-inner">
        <span className="gallery-overview__filter-label">{t("photography.filterLabel")}</span>
        <NavLink to={tagPath(null)} end className={filterLinkClass}>
          {t("photography.filterAll")}
        </NavLink>
        {tags.map((tag) => (
          <span key={tagToParam(tag)} className="contents">
            <span className="gallery-overview__filter-sep" aria-hidden>
              /
            </span>
            <NavLink to={tagPath(tag)} className={filterLinkClass}>
              {tag}
            </NavLink>
          </span>
        ))}
      </div>
    </nav>
  );
}
