import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";

export type GalleryFilterOption = {
  key: string;
  label: string;
};

type GalleryFilterNavProps = {
  /** Visible label before the filter links (e.g. “Category”). */
  label: string;
  /** `aria-label` for the nav group. */
  ariaLabel: string;
  options: GalleryFilterOption[];
  allHref: string;
  optionHref: (key: string) => string;
  activeKey: string | null;
  className?: string;
};

function filterLinkClass({ isActive }: { isActive: boolean }): string {
  return `gallery-overview__filter-btn ${isActive ? "gallery-overview__filter-btn--active" : ""}`;
}

export function GalleryFilterNav({
  label,
  ariaLabel,
  options,
  allHref,
  optionHref,
  activeKey,
  className = "",
}: GalleryFilterNavProps) {
  const { t } = useTranslation();

  if (options.length === 0) return null;

  return (
    <nav
      className={`gallery-overview__filter ${className}`.trim()}
      role="group"
      aria-label={ariaLabel}
    >
      <div className="gallery-overview__filter-inner">
        <span className="gallery-overview__filter-label">{label}</span>
        <NavLink to={allHref} end className={filterLinkClass}>
          {t("photography.filterAll")}
        </NavLink>
        {options.map((option) => (
          <span key={option.key} className="contents">
            <span className="gallery-overview__filter-sep" aria-hidden>
              /
            </span>
            <NavLink
              to={optionHref(option.key)}
              className={filterLinkClass}
              aria-current={activeKey === option.key ? "page" : undefined}
            >
              {option.label}
            </NavLink>
          </span>
        ))}
      </div>
    </nav>
  );
}
