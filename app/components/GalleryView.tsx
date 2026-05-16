import { Link, useParams, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { GalleryDetail } from "../lib/galleries";
import { localizedField, type Locale } from "../lib/i18n";

type GalleryViewProps = {
  gallery: GalleryDetail;
};

export function GalleryView({ gallery }: GalleryViewProps) {
  const { locale } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const lng = (locale ?? "da") as Locale;
  const base = `/${locale}`;
  const title = localizedField(gallery.title, lng) || "Gallery";
  const description = localizedField(gallery.description, lng);
  const activeKey = searchParams.get("photo");

  const activeIndex = activeKey
    ? gallery.images.findIndex((img) => img._key === activeKey)
    : -1;
  const activeImage = activeIndex >= 0 ? gallery.images[activeIndex] : null;

  function openPhoto(key: string) {
    setSearchParams({ photo: key }, { preventScrollReset: true });
  }

  function closePhoto() {
    setSearchParams({}, { preventScrollReset: true });
  }

  return (
    <article className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Link
        to={`${base}/photography`}
        className="inline-flex text-sm text-[var(--color-accent)] hover:underline"
      >
        ← {t("photography.back")}
      </Link>

      <header className="mt-8 max-w-2xl">
        <h1 className="font-display text-4xl font-bold">{title}</h1>
        {description && <p className="mt-4 text-[var(--color-muted)]">{description}</p>}
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          {t("photography.photoCount", { count: gallery.imageCount })}
          {gallery.location ? ` · ${gallery.location}` : ""}
          {gallery.takenAt ? ` · ${gallery.takenAt}` : ""}
        </p>
      </header>

      <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {gallery.images.map((image) => (
          <button
            key={image._key}
            type="button"
            onClick={() => openPhoto(image._key)}
            className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-left transition hover:border-[var(--color-accent)]"
          >
            <img
              src={image.imageUrl}
              srcSet={image.imageSrcSet}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              alt={image.alt || title}
              className="w-full object-cover transition duration-500 group-hover:scale-[1.02]"
              loading="lazy"
            />
            {image.caption && (
              <p className="p-3 text-sm text-[var(--color-muted)]">{image.caption}</p>
            )}
          </button>
        ))}
      </div>

      {activeImage && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={closePhoto}
          onKeyDown={(e) => e.key === "Escape" && closePhoto()}
        >
          <button
            type="button"
            onClick={closePhoto}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/20"
            aria-label={t("photography.close")}
          >
            ✕
          </button>
          {activeIndex > 0 && (
            <button
              type="button"
              className="absolute left-4 z-10 rounded-full bg-white/10 px-4 py-3 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                openPhoto(gallery.images[activeIndex - 1]._key);
              }}
            >
              ‹
            </button>
          )}
          {activeIndex < gallery.images.length - 1 && (
            <button
              type="button"
              className="absolute right-4 z-10 mr-12 rounded-full bg-white/10 px-4 py-3 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                openPhoto(gallery.images[activeIndex + 1]._key);
              }}
            >
              ›
            </button>
          )}
          <figure
            className="max-h-[90vh] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImage.imageUrl}
              srcSet={activeImage.imageSrcSet}
              sizes="100vw"
              alt={activeImage.alt || title}
              className="max-h-[85vh] w-full rounded-lg object-contain"
            />
            {activeImage.caption && (
              <figcaption className="mt-4 text-center text-sm text-white/80">
                {activeImage.caption}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </article>
  );
}
