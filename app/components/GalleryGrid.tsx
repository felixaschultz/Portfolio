import { useMemo } from "react";
import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { GalleryListItem } from "../lib/galleries";
import { buildGalleryListEntries } from "../lib/gallery-year";
import { collectGalleryTags, galleryHasTag, photographyTagPath } from "../lib/gallery-tags";
import { GalleryCard } from "./GalleryCard";
import { GalleryTagFilter } from "./GalleryTagFilter";
import { GalleryYearDivider } from "./GalleryYearDivider";
import { Reveal } from "./Reveal";

type GalleryGridProps = {
  galleries: GalleryListItem[];
  activeTag?: string | null;
};

export function GalleryGrid({ galleries, activeTag = null }: GalleryGridProps) {
  const { locale } = useParams();
  const { t } = useTranslation();
  const lng = locale ?? "da";

  const allTags = useMemo(() => collectGalleryTags(galleries), [galleries]);

  const filtered = useMemo(() => {
    if (!activeTag) return galleries;
    return galleries.filter((g) => galleryHasTag(g, activeTag));
  }, [galleries, activeTag]);

  const listEntries = useMemo(() => buildGalleryListEntries(filtered), [filtered]);

  if (galleries.length === 0) {
    return (
      <p className="gallery-overview__empty text-[var(--color-muted)]">{t("photography.empty")}</p>
    );
  }

  return (
    <>
      {allTags.length > 0 ? (
        <Reveal variant="fade" delay={120} immediate>
          <GalleryTagFilter tags={allTags} />
        </Reveal>
      ) : null}

      {activeTag && filtered.length > 0 ? (
        <Reveal as="p" className="gallery-overview__count" variant="fade" immediate>
          {t("photography.filterCount", { count: filtered.length, tag: activeTag })}
        </Reveal>
      ) : null}

      {filtered.length > 0 ? (
        <div className="gallery-overview__stage">
          <div className="gallery-overview__list gallery-overview__list--enter" key={activeTag ?? "all"}>
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
          <p className="text-[var(--color-muted)]">{t("photography.filterEmpty")}</p>
          <Link to={photographyTagPath(lng, null)} className="btn-ghost mt-6">
            {t("photography.filterAll")}
          </Link>
        </div>
      )}
    </>
  );
}
