import { Link, useParams, useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { GalleryDetail } from "../lib/galleries";
import { localizedField, type Locale } from "../lib/i18n";
import { Modal } from "./Modal";

type GalleryViewProps = {
  gallery: GalleryDetail;
};

function photoParam(image: { _key?: string }, index: number): string {
  return image._key || String(index);
}

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
    ? gallery.images.findIndex((img, index) => photoParam(img, index) === activeKey)
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
        {gallery.images.map((image, index) => (
          <button
            key={photoParam(image, index)}
            type="button"
            onClick={() => openPhoto(photoParam(image, index))}
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

      <Modal
        open={Boolean(activeImage)}
        onClose={closePhoto}
        ariaLabel={title}
        positionClassName="items-center justify-center p-2 sm:p-4"
        panelClassName="relative max-w-5xl px-1 sm:px-0"
      >
        <button
          type="button"
          onClick={closePhoto}
          className="absolute right-1 top-1 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-lg text-white hover:bg-black/80 sm:right-0 sm:top-0"
          aria-label={t("photography.close")}
        >
          ✕
        </button>
        {activeImage && activeIndex > 0 && (
          <button
            type="button"
            className="absolute left-1 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-xl text-white hover:bg-black/80 sm:left-2"
            onClick={() =>
              openPhoto(photoParam(gallery.images[activeIndex - 1], activeIndex - 1))
            }
          >
            ‹
          </button>
        )}
        {activeImage && activeIndex < gallery.images.length - 1 && (
          <button
            type="button"
            className="absolute right-1 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-xl text-white hover:bg-black/80 sm:right-2"
            onClick={() =>
              openPhoto(photoParam(gallery.images[activeIndex + 1], activeIndex + 1))
            }
          >
            ›
          </button>
        )}
        {activeImage && (
          <figure className="flex flex-col items-center">
            <img
              src={activeImage.imageUrl}
              srcSet={activeImage.imageSrcSet}
              sizes="100vw"
              alt={activeImage.alt || title}
              className="max-h-[85vh] w-full rounded-lg object-contain"
            />
            {activeImage.caption && (
              <figcaption className="mt-4 text-center text-sm text-white/90">
                {activeImage.caption}
              </figcaption>
            )}
          </figure>
        )}
      </Modal>
    </article>
  );
}
