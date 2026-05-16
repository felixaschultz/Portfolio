import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { GalleryListItem } from "../lib/galleries";
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

  return (
    <Link
      to={`${base}/photography/${gallery.slug}`}
      className="group block overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] transition hover:border-[var(--color-accent)] hover:shadow-lg hover:shadow-[var(--color-accent)]/10"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-bg)]">
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
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        {gallery.location && (
          <p className="mt-1 text-sm text-[var(--color-muted)]">{gallery.location}</p>
        )}
      </div>
    </Link>
  );
}
