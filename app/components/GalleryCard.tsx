import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { GalleryListItem } from "../lib/galleries";
import { formatGalleryDate } from "../lib/format-gallery-date";
import { photographyTagPath, tagToParam } from "../lib/gallery-tags";
import { localizedField, type Locale } from "../lib/i18n";
import { revealStagger } from "../lib/use-reveal-on-scroll";
import { GalleryImage } from "./GalleryImage";
import { Reveal } from "./Reveal";

type GalleryCardProps = {
  gallery: GalleryListItem;
  index: number;
  total: number;
};

export function GalleryCard({ gallery, index, total }: GalleryCardProps) {
  const { locale } = useParams();
  const { t } = useTranslation();
  const lng = (locale ?? "da") as Locale;
  const base = `/${locale}`;
  const title = localizedField(gallery.title, lng) || "Gallery";
  const dateLabel = formatGalleryDate(gallery.takenAt, lng);
  const tags = gallery.tags?.filter((tag) => tag.trim()).slice(0, 4) ?? [];
  const indexLabel = String(index + 1).padStart(2, "0");
  const totalLabel = String(total).padStart(2, "0");
  const metaParts = [
    dateLabel,
    gallery.location,
    t("photography.photoCount", { count: gallery.imageCount }),
  ].filter(Boolean);
  const isFeatured = index === 0;

  return (
    <Reveal
      as="article"
      className={`gallery-overview__item group ${isFeatured ? "gallery-overview__item--featured" : ""}`}
      variant="rise"
      delay={revealStagger(index)}
      immediate={index === 0}
    >
      <span className="gallery-overview__item-index" aria-hidden>
        {indexLabel} / {totalLabel}
      </span>
      <Link
        to={`${base}/photography/${gallery.slug}`}
        className="gallery-overview__item-visual"
        aria-label={title}
      >
        <GalleryImage
          src={gallery.coverUrl}
          srcSet={gallery.coverSrcSet}
          sizes={
            isFeatured
              ? "(max-width: 1023px) 100vw, min(72rem, 100vw)"
              : "(max-width: 1023px) 100vw, (max-width: 1279px) 50vw, 36rem"
          }
          alt=""
          blurSrc={gallery.coverBlurUrl}
          className="gallery-overview__item-img"
          loading={index < 2 ? "eager" : "lazy"}
          fetchPriority={index === 0 ? "high" : undefined}
        />
      </Link>
      <div className="gallery-overview__item-body">
        <Link to={`${base}/photography/${gallery.slug}`} className="gallery-overview__item-body-link">
          <h2 className="gallery-overview__item-title">{title}</h2>
          {metaParts.length > 0 ? (
            <p className="gallery-overview__item-meta">{metaParts.join(" · ")}</p>
          ) : null}
        </Link>
        {tags.length > 0 ? (
          <p className="gallery-overview__item-tags">
            {tags.map((tag, i) => (
              <span key={tagToParam(tag)}>
                {i > 0 ? <span className="text-[var(--color-border)]"> / </span> : null}
                <Link
                  to={photographyTagPath(lng, tag)}
                  className="gallery-overview__item-tag"
                >
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
