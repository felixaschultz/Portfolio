import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { GalleryListItem } from "../lib/galleries";
import { formatGalleryDate } from "../lib/format-gallery-date";
import { categoryLabel, photographyCategoryPath } from "../lib/gallery-categories";
import { photographyTagPath, tagToParam } from "../lib/gallery-tags";
import { localizedField, type Locale } from "../lib/i18n";
import { revealStagger } from "../lib/use-reveal-on-scroll";
import { GalleryImage } from "./GalleryImage";
import { GalleryOverviewShopBadge } from "./GalleryOverviewShopBadge";
import { Reveal } from "./Reveal";

type GalleryCardProps = {
  gallery: GalleryListItem;
  index: number;
};

export function GalleryCard({ gallery, index }: GalleryCardProps) {
  const { locale } = useParams();
  const { t } = useTranslation();
  const lng = (locale ?? "da") as Locale;
  const base = `/${locale}`;
  const title = localizedField(gallery.title, lng) || "Gallery";
  const dateLabel = formatGalleryDate(gallery.takenAt, lng);
  const categories = gallery.categories ?? [];
  const tags = gallery.tags?.filter((tag) => tag.trim()).slice(0, 4) ?? [];
  const metaParts = [
    dateLabel,
    gallery.location,
    t("photography.photoCount", { count: gallery.imageCount }),
  ].filter(Boolean);
  const isFeatured = index === 0;
  const shopUrl = gallery.shopUrl;

  return (
    <Reveal
      as="article"
      className={`gallery-overview__item group ${isFeatured ? "gallery-overview__item--featured" : ""}`}
      variant="rise"
      delay={revealStagger(index)}
      immediate={index === 0}
    >
      <div className="gallery-overview__item-visual">
        <Link
          to={`${base}/photography/${gallery.slug}`}
          className="gallery-overview__item-visual-link"
          aria-label={title}
        >
          <GalleryImage
            src={gallery.coverUrl}
            srcSet={gallery.coverSrcSet}
            sizes={
              isFeatured
                ? "(max-width: 1023px) 100vw, min(72rem, 100vw)"
                : "(max-width: 1023px) 100vw, (max-width: 1279px) 50vw, 33vw"
            }
            alt=""
            blurSrc={gallery.coverBlurUrl}
            className="gallery-overview__item-img"
            loading={index < 2 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : undefined}
          />
        </Link>
        {shopUrl ? <GalleryOverviewShopBadge shopUrl={shopUrl} locale={lng} /> : null}
      </div>
      <div className="gallery-overview__item-body">
        <Link to={`${base}/photography/${gallery.slug}`} className="gallery-overview__item-body-link">
          <h2 className="gallery-overview__item-title">{title}</h2>
          {metaParts.length > 0 ? (
            <p className="gallery-overview__item-meta">{metaParts.join(" · ")}</p>
          ) : null}
        </Link>
        {categories.length > 0 || tags.length > 0 ? (
          <p className="gallery-overview__item-tags">
            {categories.map((category, i) => (
              <span key={category.slug}>
                {i > 0 ? <span className="text-[var(--color-border)]"> / </span> : null}
                <Link
                  to={photographyCategoryPath(lng, category.slug)}
                  className="gallery-overview__item-tag gallery-overview__item-tag--category"
                >
                  {categoryLabel(category, lng)}
                </Link>
              </span>
            ))}
            {tags.map((tag, i) => (
              <span key={tagToParam(tag)}>
                {(categories.length > 0 || i > 0) ? (
                  <span className="text-[var(--color-border)]"> / </span>
                ) : null}
                <Link to={photographyTagPath(lng, tag)} className="gallery-overview__item-tag">
                  {tag}
                </Link>
              </span>
            ))}
          </p>
        ) : null}
      </div>
    </Reveal>
  );
}
