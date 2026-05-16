import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { GalleryDetail } from "../lib/galleries";
import { localizedField, resolveSanityString, type Locale } from "../lib/i18n";
import { Modal } from "./Modal";

type GalleryViewProps = {
  gallery: GalleryDetail;
};

function photoParam(image: { _key?: string }, index: number): string {
  return image._key || String(index);
}

export function GalleryView({ gallery }: GalleryViewProps) {
  const { locale } = useParams();
  const { t } = useTranslation();
  const lng = (locale ?? "da") as Locale;
  const base = `/${locale}`;
  const title = localizedField(gallery.title, lng) || "Gallery";
  const description = localizedField(gallery.description, lng);

  const [activeKey, setActiveKey] = useState<string | null>(null);

  const activeIndex = activeKey
    ? gallery.images.findIndex((img, index) => photoParam(img, index) === activeKey)
    : -1;
  const activeImage = activeIndex >= 0 ? gallery.images[activeIndex] : null;

  const openPhoto = useCallback((key: string) => {
    setActiveKey(key);
  }, []);

  const closePhoto = useCallback(() => {
    setActiveKey(null);
  }, []);

  useEffect(() => {
    if (activeKey === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && activeIndex > 0) {
        e.preventDefault();
        const prev = gallery.images[activeIndex - 1];
        setActiveKey(photoParam(prev, activeIndex - 1));
      }
      if (e.key === "ArrowRight" && activeIndex < gallery.images.length - 1) {
        e.preventDefault();
        const next = gallery.images[activeIndex + 1];
        setActiveKey(photoParam(next, activeIndex + 1));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeKey, activeIndex, gallery.images]);

  function imageCaption(caption: GalleryDetail["images"][number]["caption"]): string {
    return resolveSanityString(caption, lng);
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
        {description ? <p className="mt-4 text-[var(--color-muted)]">{description}</p> : null}
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          {t("photography.photoCount", { count: gallery.imageCount })}
          {gallery.location ? ` · ${gallery.location}` : ""}
          {gallery.takenAt ? ` · ${gallery.takenAt}` : ""}
        </p>
      </header>

      <div className="mt-12 grid grid-cols-1 items-center justify-items-center gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gallery.images.map((image, index) => {
          const caption = imageCaption(image.caption);
          return (
            <button
              key={photoParam(image, index)}
              type="button"
              onClick={() => openPhoto(photoParam(image, index))}
              className="group block w-full cursor-pointer overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-left transition hover:border-[var(--color-accent)]"
            >
              <img
                src={image.imageUrl}
                srcSet={image.imageSrcSet}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                alt={image.alt || title}
                className="pointer-events-none w-full transition duration-500 group-hover:scale-[1.02]"
                loading="lazy"
              />
              {caption ? (
                <p className="pointer-events-none p-3 text-sm text-[var(--color-muted)]">{caption}</p>
              ) : null}
            </button>
          );
        })}
      </div>

      {activeImage ? (
        <Modal
          open
          onClose={closePhoto}
          ariaLabel={title}
          positionClassName="modal-overlay--center"
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
          {activeIndex > 0 ? (
            <button
              type="button"
              className="absolute left-1 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-xl text-white hover:bg-black/80 sm:left-2"
              onClick={() =>
                openPhoto(photoParam(gallery.images[activeIndex - 1], activeIndex - 1))
              }
            >
              ‹
            </button>
          ) : null}
          {activeIndex < gallery.images.length - 1 ? (
            <button
              type="button"
              className="absolute right-1 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-xl text-white hover:bg-black/80 sm:right-2"
              onClick={() =>
                openPhoto(photoParam(gallery.images[activeIndex + 1], activeIndex + 1))
              }
            >
              ›
            </button>
          ) : null}
          <figure className="flex flex-col items-center">
            <img
              src={activeImage.imageUrl}
              srcSet={activeImage.imageSrcSet}
              sizes="100vw"
              alt={activeImage.alt || title}
              className="max-h-[85vh] w-full rounded-lg object-contain"
            />
            {imageCaption(activeImage.caption) ? (
              <figcaption className="mt-4 text-center text-sm text-white/90">
                {imageCaption(activeImage.caption)}
              </figcaption>
            ) : null}
          </figure>
        </Modal>
      ) : null}
    </article>
  );
}
