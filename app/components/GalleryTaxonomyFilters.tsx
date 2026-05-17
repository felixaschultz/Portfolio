import { useMemo } from "react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { GalleryListItem } from "../lib/galleries";
import { collectGalleryCategories, photographyCategoryPath } from "../lib/gallery-categories";
import { collectGalleryTags, photographyTagPath, tagToParam } from "../lib/gallery-tags";
import type { Locale } from "../lib/i18n";
import { GalleryFilterNav, type GalleryFilterOption } from "./GalleryFilterNav";
import { Reveal } from "./Reveal";

type GalleryTaxonomyFiltersProps = {
  galleries: GalleryListItem[];
  activeTag?: string | null;
  activeCategorySlug?: string | null;
};

export function GalleryTaxonomyFilters({
  galleries,
  activeTag = null,
  activeCategorySlug = null,
}: GalleryTaxonomyFiltersProps) {
  const { locale } = useParams();
  const { t } = useTranslation();
  const lng = (locale ?? "da") as Locale;

  const tagOptions: GalleryFilterOption[] = useMemo(() => {
    return collectGalleryTags(galleries).map((tag) => ({
      key: tagToParam(tag),
      label: tag,
    }));
  }, [galleries]);

  const categoryOptions = useMemo(
    () =>
      collectGalleryCategories(galleries, lng).map((c) => ({
        key: c.slug,
        label: c.label,
      })),
    [galleries, lng],
  );

  const allHref = photographyTagPath(lng, null);

  const activeTagKey = activeTag ? tagToParam(activeTag) : null;

  if (tagOptions.length === 0 && categoryOptions.length === 0) return null;

  return (
    <div className="gallery-overview__filters">
      {categoryOptions.length > 0 ? (
        <Reveal variant="fade" delay={80} immediate>
          <GalleryFilterNav
            label={t("photography.filterCategoryLabel")}
            ariaLabel={t("photography.filterCategoryAria")}
            options={categoryOptions}
            allHref={photographyCategoryPath(lng, null)}
            optionHref={(slug) => photographyCategoryPath(lng, slug)}
            activeKey={activeCategorySlug}
          />
        </Reveal>
      ) : null}
      {tagOptions.length > 0 ? (
        <Reveal variant="fade" delay={categoryOptions.length > 0 ? 140 : 80} immediate>
          <GalleryFilterNav
            label={t("photography.filterLabel")}
            ariaLabel={t("photography.filterTagAria")}
            options={tagOptions}
            allHref={allHref}
            optionHref={(key) => {
              const label = tagOptions.find((o) => o.key === key)?.label;
              return label ? photographyTagPath(lng, label) : allHref;
            }}
            activeKey={activeTagKey}
            className={categoryOptions.length > 0 ? "gallery-overview__filter--secondary" : ""}
          />
        </Reveal>
      ) : null}
    </div>
  );
}
