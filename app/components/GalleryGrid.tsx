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
    return <p className="mt-12 text-center text-[var(--color-muted)]">{t("photography.empty")}</p>;
  }

  const hasTags = allTags.length > 0;

  return (
    <div
      className={`mt-12 ${hasTags ? "flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10" : ""}`}
    >
      {hasTags ? (
        <aside className="w-full shrink-0 border-b border-[var(--color-border)] pb-8 lg:w-52 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
          <GalleryTagFilter tags={allTags} activeTag={activeTag} onSelect={selectTag} />
        </aside>
      ) : null}

      <div className="min-w-0 flex-1">
        {activeTag && filtered.length > 0 ? (
          <p className="mb-6 text-sm text-[var(--color-muted)]">
            {t("photography.filterCount", { count: filtered.length, tag: activeTag })}
          </p>
        ) : null}

        {filtered.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" key={activeTag ?? "all"}>
            {filtered.map((gallery) => (
              <GalleryCard key={gallery._id} gallery={gallery} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-[var(--color-muted)]">{t("photography.filterEmpty")}</p>
            <button type="button" onClick={() => selectTag(null)} className="btn-ghost mt-4">
              {t("photography.filterAll")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
