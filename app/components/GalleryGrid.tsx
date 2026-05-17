import { useMemo } from "react";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { GalleryListItem } from "../lib/galleries";
import {
  collectGalleryTags,
  galleryHasTag,
  tagFromParam,
  tagToParam,
} from "../lib/gallery-tags";
import { GalleryCard } from "./GalleryCard";
import { GalleryTagFilter } from "./GalleryTagFilter";
import { Reveal } from "./Reveal";

type GalleryGridProps = {
  galleries: GalleryListItem[];
};

export function GalleryGrid({ galleries }: GalleryGridProps) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const allTags = useMemo(() => collectGalleryTags(galleries), [galleries]);
  const tagParam = searchParams.get("tag");
  const activeTag = useMemo(
    () => (tagParam ? tagFromParam(tagParam, allTags) : null),
    [tagParam, allTags],
  );

  const filtered = useMemo(() => {
    if (!activeTag) return galleries;
    return galleries.filter((g) => galleryHasTag(g, activeTag));
  }, [galleries, activeTag]);

  function selectTag(tag: string | null) {
    const next = new URLSearchParams(searchParams);
    if (tag) next.set("tag", tagToParam(tag));
    else next.delete("tag");
    setSearchParams(next, { replace: true, preventScrollReset: true });
  }

  if (galleries.length === 0) {
    return (
      <p className="gallery-overview__empty text-[var(--color-muted)]">{t("photography.empty")}</p>
    );
  }

  return (
    <>
      {allTags.length > 0 ? (
        <Reveal variant="fade" delay={120} immediate>
          <GalleryTagFilter tags={allTags} activeTag={activeTag} onSelect={selectTag} />
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
            {filtered.map((gallery, index) => (
              <GalleryCard key={gallery._id} gallery={gallery} index={index} total={filtered.length} />
            ))}
          </div>
        </div>
      ) : (
        <div className="gallery-overview__empty">
          <p className="text-[var(--color-muted)]">{t("photography.filterEmpty")}</p>
          <button type="button" onClick={() => selectTag(null)} className="btn-ghost mt-6">
            {t("photography.filterAll")}
          </button>
        </div>
      )}
    </>
  );
}
