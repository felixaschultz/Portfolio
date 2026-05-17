import { useMemo } from "react";
import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { GalleryListItem } from "../lib/galleries";
import { categoryLabel, galleryHasCategory } from "../lib/gallery-categories";
import { buildGalleryListEntries } from "../lib/gallery-year";
import { galleryHasTag, photographyTagPath } from "../lib/gallery-tags";
import type { Locale } from "../lib/i18n";
import { GalleryCard } from "./GalleryCard";
import { GalleryTaxonomyFilters } from "./GalleryTaxonomyFilters";
import { GalleryYearDivider } from "./GalleryYearDivider";
import { Reveal } from "./Reveal";

type GalleryGridProps = {
  galleries: GalleryListItem[];
  activeTag?: string | null;
  activeCategorySlug?: string | null;
};

export function GalleryGrid({
  galleries,
  activeTag = null,
  activeCategorySlug = null,
}: GalleryGridProps) {
  const { locale } = useParams();
  const { t } = useTranslation();
  const lng = (locale ?? "da") as Locale;

  const filtered = useMemo(() => {
    let list = galleries;
    if (activeCategorySlug) {
      list = list.filter((g) => galleryHasCategory(g, activeCategorySlug));
    }
    if (activeTag) {
      list = list.filter((g) => galleryHasTag(g, activeTag));
    }
    return list;
  }, [galleries, activeCategorySlug, activeTag]);

  const listEntries = useMemo(() => buildGalleryListEntries(filtered), [filtered]);

  const activeCategoryLabel = useMemo(() => {
    if (!activeCategorySlug) return null;
    for (const gallery of galleries) {
      const match = gallery.categories?.find((c) => c.slug === activeCategorySlug);
      if (match) return categoryLabel(match, lng);
    }
    return activeCategorySlug;
  }, [activeCategorySlug, galleries, lng]);

  const filterKey = [activeCategorySlug ?? "all", activeTag ?? "all"].join(":");

  if (galleries.length === 0) {
    return (
      <p className="gallery-overview__empty text-[var(--color-muted)]">{t("photography.empty")}</p>
    );
  }

  const hasActiveFilter = Boolean(activeTag || activeCategorySlug);

  return (
    <>
      <GalleryTaxonomyFilters
        galleries={galleries}
        activeTag={activeTag}
        activeCategorySlug={activeCategorySlug}
      />

      {activeCategorySlug && filtered.length > 0 ? (
        <Reveal as="p" className="gallery-overview__count" variant="fade" immediate>
          {t("photography.filterCategoryCount", {
            count: filtered.length,
            category: activeCategoryLabel ?? activeCategorySlug,
          })}
        </Reveal>
      ) : null}

      {activeTag && filtered.length > 0 && !activeCategorySlug ? (
        <Reveal as="p" className="gallery-overview__count" variant="fade" immediate>
          {t("photography.filterCount", { count: filtered.length, tag: activeTag })}
        </Reveal>
      ) : null}

      {filtered.length > 0 ? (
        <div className="gallery-overview__stage">
          <div className="gallery-overview__list gallery-overview__list--enter" key={filterKey}>
            {listEntries.map((entry) =>
              entry.kind === "year" ? (
                <GalleryYearDivider key={`year-${entry.year}`} year={entry.year} />
              ) : (
                <GalleryCard
                  key={entry.gallery._id}
                  gallery={entry.gallery}
                  index={entry.index}
                  total={filtered.length}
                />
              ),
            )}
          </div>
        </div>
      ) : (
        <div className="gallery-overview__empty">
          <p className="text-[var(--color-muted)]">
            {activeCategorySlug
              ? t("photography.filterCategoryEmpty")
              : t("photography.filterEmpty")}
          </p>
          {hasActiveFilter ? (
            <Link to={photographyTagPath(lng, null)} className="btn-ghost mt-6">
              {t("photography.filterAll")}
            </Link>
          ) : null}
        </div>
      )}
    </>
  );
}
