import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { GalleryDetail, GalleryImageItem } from "../lib/galleries";
import { formatGalleryDate } from "../lib/format-gallery-date";
import { tagToParam } from "../lib/gallery-tags";
import { localizedField, resolveSanityString, type Locale } from "../lib/i18n";
import { Modal } from "./Modal";

type GalleryViewProps = {
  gallery: GalleryDetail;
};

function resolveCoverImage(gallery: GalleryDetail): GalleryImageItem | null {
  if (gallery.images.length === 0) return null;
  if (gallery.coverImageKey) {
    const picked = gallery.images.find((img) => img._key === gallery.coverImageKey);
    if (picked) return picked;
  }
  return gallery.images[0];
}

type AlbumPhotoProps = {
  image: GalleryImageItem;
  index: number;
  total: number;
  title: string;
  caption: string;
  onOpen: (key: string) => void;
};

function AlbumPhoto({ image, index, total, title, caption, onOpen }: AlbumPhotoProps) {
  const indexLabel = String(index + 1).padStart(2, "0");
  const totalLabel = String(total).padStart(2, "0");

  return (
    <figure className="gallery-album__figure">
      <span className="gallery-album__index" aria-hidden>
        {indexLabel} / {totalLabel}
      </span>
      <button
        type="button"
        className="gallery-album__shot"
        onClick={() => onOpen(image._key)}
        aria-label={caption || `${title} — ${indexLabel}`}
      >
        <span className="gallery-album__frame">
          <img
            src={image.imageUrl}
            srcSet={image.imageSrcSet}
            sizes="100vw"
            alt={image.alt || title}
            className="gallery-album__img"
            loading="lazy"
          />
        </span>
      </button>
      {caption ? <figcaption className="gallery-album__caption">{caption}</figcaption> : null}
    </figure>
  );
}

export function GalleryView({ gallery }: GalleryViewProps) {
  const { locale } = useParams();
  const { t } = useTranslation();
  const lng = (locale ?? "da") as Locale;
  const base = `/${locale}`;
  const title = localizedField(gallery.title, lng) || "Gallery";
  const description = localizedField(gallery.description, lng);
  const dateLabel = formatGalleryDate(gallery.takenAt, lng);
  const tags = gallery.tags?.filter((tag) => tag.trim()) ?? [];

  const coverImage = useMemo(() => resolveCoverImage(gallery), [gallery]);
  const moreImages = useMemo(() => {
    if (!coverImage) return gallery.images;
    return gallery.images.filter((img) => img._key !== coverImage._key);
  }, [gallery.images, coverImage]);

  const [activeKey, setActiveKey] = useState<string | null>(null);

  const activeIndex = activeKey
    ? gallery.images.findIndex((img) => img._key === activeKey)
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
      if (e.key === "Escape") {
        closePhoto();
        return;
      }
      if (e.key === "ArrowLeft" && activeIndex > 0) {
        e.preventDefault();
        setActiveKey(gallery.images[activeIndex - 1]._key);
      }
      if (e.key === "ArrowRight" && activeIndex < gallery.images.length - 1) {
        e.preventDefault();
        setActiveKey(gallery.images[activeIndex + 1]._key);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeKey, activeIndex, gallery.images, closePhoto]);

  function imageCaption(caption: GalleryImageItem["caption"]): string {
    return resolveSanityString(caption, lng);
  }

  const metaParts = [dateLabel, gallery.location, t("photography.photoCount", { count: gallery.imageCount })].filter(
    Boolean,
  );

  const coverIndex = coverImage
    ? gallery.images.findIndex((img) => img._key === coverImage._key)
    : 0;

  return (
    <article className="gallery-album">
      {coverImage ? (
        <section className="gallery-album__hero">
          <Link to={`${base}/photography`} className="gallery-album__back">
            ← {t("photography.back")}
          </Link>

          <button
            type="button"
            className="gallery-album__hero-media"
            onClick={() => openPhoto(coverImage._key)}
            aria-label={title}
          >
            <img
              src={coverImage.imageUrl}
              srcSet={coverImage.imageSrcSet}
              sizes="100vw"
              alt={coverImage.alt || title}
              className="gallery-album__hero-img"
              fetchPriority="high"
            />
            <div className="gallery-album__hero-shade" aria-hidden />
          </button>

          <div className="gallery-album__hero-copy">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[var(--color-muted)]">
              {String(coverIndex + 1).padStart(2, "0")} / {String(gallery.imageCount).padStart(2, "0")}
            </p>
            <h1 className="gallery-album__title">{title}</h1>
            {metaParts.length > 0 ? <p className="gallery-album__meta">{metaParts.join(" · ")}</p> : null}
          </div>
        </section>
      ) : (
        <header className="gallery-album__intro">
          <Link to={`${base}/photography`} className="gallery-album__back gallery-album__back--plain">
            ← {t("photography.back")}
          </Link>
          <h1 className="gallery-album__title mt-10">{title}</h1>
          {metaParts.length > 0 ? <p className="gallery-album__meta">{metaParts.join(" · ")}</p> : null}
        </header>
      )}

      {(description || tags.length > 0) && (
        <div className={`gallery-album__intro ${coverImage ? "border-t border-[var(--color-border)]" : ""}`}>
          {description ? <p className="gallery-album__description">{description}</p> : null}
          {tags.length > 0 ? (
            <p className="gallery-album__tags">
              {tags.map((tag, i) => (
                <span key={tagToParam(tag)}>
                  {i > 0 ? <span className="text-[var(--color-border)]"> / </span> : null}
                  <Link
                    to={`${base}/photography?tag=${encodeURIComponent(tagToParam(tag))}`}
                    className="gallery-album__tag"
                  >
                    {tag}
                  </Link>
                </span>
              ))}
            </p>
          ) : null}
        </div>
      )}

      {moreImages.length > 0 ? (
        <div className="gallery-album__stream">
          {moreImages.map((image, index) => (
            <AlbumPhoto
              key={image._key}
              image={image}
              index={coverImage ? index + 1 : index}
              total={gallery.imageCount}
              title={title}
              caption={imageCaption(image.caption)}
              onOpen={openPhoto}
            />
          ))}
        </div>
      ) : null}

      {activeImage ? (
        <Modal
          open
          onClose={closePhoto}
          ariaLabel={title}
          positionClassName="modal-overlay--center"
          panelClassName="relative max-w-[min(96vw,1800px)] px-0"
        >
          <p className="absolute left-2 top-2 z-20 font-mono text-[11px] uppercase tracking-[0.2em] text-white/70 sm:left-4 sm:top-4">
            {String(activeIndex + 1).padStart(2, "0")} / {String(gallery.imageCount).padStart(2, "0")}
          </p>
          <button
            type="button"
            onClick={closePhoto}
            className="absolute right-2 top-2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-lg text-white backdrop-blur-sm transition hover:bg-white/20 sm:right-4 sm:top-4"
            aria-label={t("photography.close")}
          >
            ✕
          </button>
          {activeIndex > 0 ? (
            <button
              type="button"
              className="absolute left-2 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white backdrop-blur-sm transition hover:bg-white/20 sm:left-4"
              onClick={() => setActiveKey(gallery.images[activeIndex - 1]._key)}
              aria-label={t("photography.previous")}
            >
              ‹
            </button>
          ) : null}
          {activeIndex < gallery.images.length - 1 ? (
            <button
              type="button"
              className="absolute right-2 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white backdrop-blur-sm transition hover:bg-white/20 sm:right-4"
              onClick={() => setActiveKey(gallery.images[activeIndex + 1]._key)}
              aria-label={t("photography.next")}
            >
              ›
            </button>
          ) : null}
          <figure className="flex flex-col items-center px-2 py-8 sm:px-4">
            <img
              src={activeImage.imageUrl}
              srcSet={activeImage.imageSrcSet}
              sizes="100vw"
              alt={activeImage.alt || title}
              className="max-h-[88vh] w-full object-contain"
            />
            {imageCaption(activeImage.caption) ? (
              <figcaption className="gallery-album__caption mt-8 text-center text-white/85">
                {imageCaption(activeImage.caption)}
              </figcaption>
            ) : null}
          </figure>
        </Modal>
      ) : null}
    </article>
  );
}
