import { useMemo } from "react";
import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { GalleryListItem, PortfolioPhotoItem } from "../lib/galleries";
import {
  collectGalleryTags,
  photoHasTag,
  photographyPhotosPath,
  photographyTagPath,
} from "../lib/gallery-tags";
import { localizedField, type Locale } from "../lib/i18n";
import { revealStagger } from "../lib/use-reveal-on-scroll";
import { GalleryImage } from "./GalleryImage";
import { GalleryMasonry } from "./GalleryMasonry";
import { GalleryTagFilter } from "./GalleryTagFilter";
import { Reveal } from "./Reveal";

type AllPhotosOverviewProps = {
  photos: PortfolioPhotoItem[];
  galleries: GalleryListItem[];
  activeTag?: string | null;
};

export function AllPhotosOverview({ photos, galleries, activeTag = null }: AllPhotosOverviewProps) {
  const { locale } = useParams();
  const { t } = useTranslation();
  const lng = (locale ?? "da") as Locale;
  const base = `/${locale}`;

  const allTags = useMemo(() => collectGalleryTags(galleries), [galleries]);

  const filtered = useMemo(() => {
    if (!activeTag) return photos;
    return photos.filter((photo) => photoHasTag(photo, activeTag));
  }, [photos, activeTag]);

  return (
    <div className="gallery-overview all-photos">
      <Reveal as="header" className="gallery-overview__header" variant="fade" immediate>
        <p className="mb-6">
          <Link to={`${base}/photography`} className="gallery-album__back gallery-album__back--plain">
            ← {t("photography.back")}
          </Link>
        </p>
        <h1 className="gallery-overview__title">{t("photography.allPhotosPageTitle")}</h1>
        <p className="gallery-overview__lede">{t("photography.allPhotosPageDescription")}</p>
        <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
          {t("photography.allPhotosCount", { count: photos.length })}
        </p>
        <p className="mt-8">
          <Link to={photographyTagPath(lng, null)} className="btn-ghost text-sm">
            {t("photography.browseGalleries")} →
          </Link>
        </p>
      </Reveal>

      {allTags.length > 0 ? (
        <Reveal variant="fade" delay={120} immediate>
          <GalleryTagFilter tags={allTags} resolveTagPath={photographyPhotosPath} />
        </Reveal>
      ) : null}

      {activeTag && filtered.length > 0 ? (
        <Reveal as="p" className="gallery-overview__count" variant="fade" immediate>
          {t("photography.filterPhotosCount", { count: filtered.length, tag: activeTag })}
        </Reveal>
      ) : null}

      {filtered.length > 0 ? (
        <GalleryMasonry
          images={filtered}
          seed={`all-photos-${activeTag ?? "all"}`}
          className="all-photos__stream"
          renderItem={(photo, index) => {
            const galleryTitle = localizedField(photo.galleryTitle, lng) || "Gallery";
            const label = photo.alt || photo.caption || galleryTitle;
            return (
              <Reveal
                key={`${photo.gallerySlug}-${photo._key}`}
                as="figure"
                className="gallery-mosaic__item all-photos__figure"
                variant="scale"
                delay={revealStagger(index, 40, 280)}
              >
                <Link
                  to={`${base}/photography/${photo.gallerySlug}?photo=${photo._key}`}
                  className="all-photos__link"
                >
                  <GalleryImage
                    src={photo.imageUrl}
                    srcSet={photo.imageSrcSet}
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                    alt={label}
                    blurSrc={photo.imageBlurUrl}
                    className="all-photos__img"
                    loading="lazy"
                  />
                  <span className="all-photos__overlay">
                    <span className="all-photos__gallery-name">{galleryTitle}</span>
                    {photo.caption ? (
                      <span className="all-photos__caption">{photo.caption}</span>
                    ) : null}
                  </span>
                </Link>
              </Reveal>
            );
          }}
        />
      ) : (
        <div className="gallery-overview__empty">
          <p className="text-[var(--color-muted)]">{t("photography.filterPhotosEmpty")}</p>
          <Link to={photographyPhotosPath(lng, null)} className="btn-ghost mt-6">
            {t("photography.filterAll")}
          </Link>
        </div>
      )}
    </div>
  );
}
