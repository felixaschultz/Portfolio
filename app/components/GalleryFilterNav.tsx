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
  /** Chips for broad categories; inline slash list for tags. */
  variant?: "inline" | "chips";
};

function inlineLinkClass({ isActive }: { isActive: boolean }): string {
  return `gallery-overview__filter-btn ${isActive ? "gallery-overview__filter-btn--active" : ""}`;
}

function chipLinkClass({ isActive }: { isActive: boolean }): string {
  return `gallery-overview__filter-chip ${isActive ? "gallery-overview__filter-chip--active" : ""}`;
}

export function GalleryFilterNav({
  label,
  ariaLabel,
  options,
  allHref,
  optionHref,
  activeKey,
  className = "",
  variant = "inline",
}: GalleryFilterNavProps) {
  const { t } = useTranslation();

  if (options.length === 0) return null;

  const isChips = variant === "chips";

  return (
    <nav
      className={[
        "gallery-overview__filter",
        isChips ? "gallery-overview__filter--categories" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="group"
      aria-label={ariaLabel}
    >
      <div
        className={[
          "gallery-overview__filter-inner",
          isChips ? "gallery-overview__filter-inner--categories" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span
          className={[
            "gallery-overview__filter-label",
            isChips ? "gallery-overview__filter-label--categories" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {label}
        </span>

        {isChips ? (
          <div className="gallery-overview__filter-chips">
            <NavLink to={allHref} end className={chipLinkClass}>
              {t("photography.filterAll")}
            </NavLink>
            {options.map((option) => (
              <NavLink
                key={option.key}
                to={optionHref(option.key)}
                className={chipLinkClass}
                aria-current={activeKey === option.key ? "page" : undefined}
              >
                {option.label}
              </NavLink>
            ))}
          </div>
        ) : (
          <>
            <NavLink to={allHref} end className={inlineLinkClass}>
              {t("photography.filterAll")}
            </NavLink>
            {options.map((option) => (
              <span key={option.key} className="contents">
                <span className="gallery-overview__filter-sep" aria-hidden>
                  /
                </span>
                <NavLink
                  to={optionHref(option.key)}
                  className={inlineLinkClass}
                  aria-current={activeKey === option.key ? "page" : undefined}
                >
                  {option.label}
                </NavLink>
              </span>
            ))}
          </>
        )}
      </div>
    </nav>
  );
}
