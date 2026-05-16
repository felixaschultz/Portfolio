import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { GalleryListItem } from "../lib/galleries";
import { formatGalleryDate } from "../lib/format-gallery-date";
import { tagToParam } from "../lib/gallery-tags";
import { localizedField, type Locale } from "../lib/i18n";

type GalleryCardProps = {
  gallery: GalleryListItem;
};

export function GalleryCard({ gallery }: GalleryCardProps) {
  const { locale } = useParams();
  const { t } = useTranslation();
  const lng = (locale ?? "da") as Locale;
  const base = `/${locale}`;
  const title = localizedField(gallery.title, lng) || "Gallery";
  const dateLabel = formatGalleryDate(gallery.takenAt, lng);
  const tags = gallery.tags?.filter((tag) => tag.trim()).slice(0, 4) ?? [];

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] transition hover:border-[var(--color-accent)] hover:shadow-lg hover:shadow-[var(--color-accent)]/10">
      <Link
        to={`${base}/photography/${gallery.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-[var(--color-bg)]"
      >
        <img
          src={gallery.coverUrl}
          srcSet={gallery.coverSrcSet}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          alt={title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {t("photography.photoCount", { count: gallery.imageCount })}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <Link to={`${base}/photography/${gallery.slug}`} className="block">
          <h3 className="font-display text-lg font-semibold transition group-hover:text-[var(--color-accent)]">
            {title}
          </h3>
        </Link>
        {(dateLabel || gallery.location) && (
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {[dateLabel, gallery.location].filter(Boolean).join(" · ")}
          </p>
        )}
        {tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Link
                key={tagToParam(tag)}
                to={`${base}/photography?tag=${encodeURIComponent(tagToParam(tag))}`}
                className="rounded-full border border-[var(--color-border)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                {tag}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
