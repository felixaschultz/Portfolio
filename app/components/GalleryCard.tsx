import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { GalleryListItem } from "../lib/galleries";
import { formatGalleryDate } from "../lib/format-gallery-date";
import { tagToParam } from "../lib/gallery-tags";
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

  return (
    <Reveal
      as="article"
      className="gallery-overview__item group"
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
          sizes="100vw"
          alt={title}
          blurSrc={gallery.coverBlurUrl}
          className="gallery-overview__item-img"
          loading={index < 2 ? "eager" : "lazy"}
          fetchPriority={index === 0 ? "high" : undefined}
        />
        <div className="gallery-overview__item-shade" aria-hidden />
        <div className="gallery-overview__item-copy gallery-cover__copy">
          <h2 className="gallery-overview__item-title">{title}</h2>
          {metaParts.length > 0 ? (
            <p className="gallery-overview__item-meta">{metaParts.join(" · ")}</p>
          ) : null}
        </div>
      </Link>
      {tags.length > 0 ? (
        <p className="gallery-overview__item-tags px-6 sm:px-10 lg:px-14">
          {tags.map((tag, i) => (
            <span key={tagToParam(tag)}>
              {i > 0 ? <span className="text-[var(--color-border)]"> / </span> : null}
              <Link
                to={`${base}/photography?tag=${encodeURIComponent(tagToParam(tag))}`}
                className="gallery-overview__item-tag"
                onClick={(e) => e.stopPropagation()}
              >
                {tag}
              </Link>
            </span>
          ))}
        </p>
      ) : null}
    </Reveal>
  );
}
