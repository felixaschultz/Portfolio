import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { GalleryImageItem } from "../lib/galleries";
import { preloadImage } from "../lib/preload-image";
import { Modal } from "./Modal";
import { ProtectedGallerySurface } from "./ProtectedGallerySurface";

const SWIPE_THRESHOLD_PX = 56;
const FADE_MS = 320;

type GalleryLightboxProps = {
  images: GalleryImageItem[];
  albumTitle: string;
  captionFor: (image: GalleryImageItem) => string;
};

export function GalleryLightbox({ images, albumTitle, captionFor }: GalleryLightboxProps) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const photoKey = searchParams.get("photo");

  const activeIndex = photoKey ? images.findIndex((img) => img._key === photoKey) : -1;
  const activeImage = activeIndex >= 0 ? images[activeIndex] : null;

  const [displayKey, setDisplayKey] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const effectiveKey = displayKey ?? photoKey;
  const displayIndex = effectiveKey ? images.findIndex((img) => img._key === effectiveKey) : -1;
  const displayImage = displayIndex >= 0 ? images[displayIndex] : null;

  const setPhotoKey = useCallback(
    (key: string | null) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (key) next.set("photo", key);
          else next.delete("photo");
          return next;
        },
        { replace: true, preventScrollReset: true },
      );
    },
    [setSearchParams],
  );

  useEffect(() => {
    if (photoKey && !images.some((img) => img._key === photoKey)) {
      setPhotoKey(null);
    }
  }, [photoKey, images, setPhotoKey]);

  const goTo = useCallback(
    (index: number) => {
      const target = images[index];
      if (target) setPhotoKey(target._key);
    },
    [images, setPhotoKey],
  );

  const close = useCallback(() => setPhotoKey(null), [setPhotoKey]);

  useEffect(() => {
    if (!photoKey) {
      setVisible(false);
      const timer = window.setTimeout(() => setDisplayKey(null), FADE_MS);
      return () => window.clearTimeout(timer);
    }

    if (displayKey === photoKey) {
      setVisible(true);
      return;
    }

    if (displayKey === null) {
      setDisplayKey(photoKey);
      requestAnimationFrame(() => setVisible(true));
      return;
    }

    setVisible(false);
    const timer = window.setTimeout(() => {
      setDisplayKey(photoKey);
      requestAnimationFrame(() => setVisible(true));
    }, FADE_MS);
    return () => window.clearTimeout(timer);
  }, [photoKey, displayKey]);

  useEffect(() => {
    if (activeIndex < 0) return;
    for (const offset of [-1, 1]) {
      const neighbor = images[activeIndex + offset];
      if (neighbor) preloadImage(neighbor.imageFullUrl ?? neighbor.imageUrl);
    }
  }, [activeIndex, images]);

  useEffect(() => {
    if (!photoKey) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key === "ArrowLeft" && activeIndex > 0) {
        e.preventDefault();
        goTo(activeIndex - 1);
      }
      if (e.key === "ArrowRight" && activeIndex < images.length - 1) {
        e.preventDefault();
        goTo(activeIndex + 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [photoKey, activeIndex, images.length, close, goTo]);

  if (!photoKey || !displayImage) return null;

  const caption = captionFor(displayImage);

  return (
    <Modal
      open={Boolean(photoKey)}
      onClose={close}
      ariaLabel={albumTitle}
      positionClassName="modal-overlay--fullscreen"
      panelClassName="modal-panel--fullscreen gallery-lightbox"
      backdropClassName="modal-overlay__backdrop--gallery"
    >
      <div className="gallery-lightbox__chrome">
        <p className="gallery-lightbox__counter">
          {String(displayIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
        </p>
        <button type="button" onClick={close} className="gallery-lightbox__btn" aria-label={t("photography.close")}>
          {t("photography.close")}
        </button>
      </div>

      {displayIndex > 0 ? (
        <button
          type="button"
          className="gallery-lightbox__nav gallery-lightbox__nav--prev"
          onClick={() => goTo(displayIndex - 1)}
          aria-label={t("photography.previous")}
        >
          ‹
        </button>
      ) : null}
      {displayIndex < images.length - 1 ? (
        <button
          type="button"
          className="gallery-lightbox__nav gallery-lightbox__nav--next"
          onClick={() => goTo(displayIndex + 1)}
          aria-label={t("photography.next")}
        >
          ›
        </button>
      ) : null}

      <ProtectedGallerySurface
        as="figure"
        className="gallery-lightbox__stage"
        onTouchStart={(e) => {
          touchStartX.current = e.changedTouches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const start = touchStartX.current;
          touchStartX.current = null;
          if (start === null) return;
          const end = e.changedTouches[0]?.clientX;
          if (end === undefined) return;
          const delta = end - start;
          if (delta > SWIPE_THRESHOLD_PX && displayIndex > 0) goTo(displayIndex - 1);
          if (delta < -SWIPE_THRESHOLD_PX && displayIndex < images.length - 1) goTo(displayIndex + 1);
        }}
      >
        <img
          key={effectiveKey}
          src={displayImage.imageFullUrl ?? displayImage.imageUrl}
          srcSet={displayImage.imageFullSrcSet ?? displayImage.imageSrcSet}
          sizes="100vw"
          alt={displayImage.alt || albumTitle}
          draggable={false}
          className={`gallery-lightbox__img ${visible ? "gallery-lightbox__img--visible" : ""}`}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        />
        <span className="gallery-protected__shield gallery-protected__shield--lightbox" aria-hidden />
        {caption ? <figcaption className="gallery-lightbox__caption">{caption}</figcaption> : null}
      </ProtectedGallerySurface>
    </Modal>
  );
}

/** Open the lightbox for a given image key (updates URL). */
export function useGalleryLightbox() {
  const [, setSearchParams] = useSearchParams();

  return useCallback((key: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("photo", key);
        return next;
      },
      { replace: true, preventScrollReset: true },
    );
  }, [setSearchParams]);
}
