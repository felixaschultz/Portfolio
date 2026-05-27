import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import type { HomeSpotlightSlide } from "../lib/home-spotlight";
import { localizedField, type Locale } from "../lib/i18n";
import { GalleryImage } from "./GalleryImage";

type HomeSpotlightSliderProps = {
  slides: HomeSpotlightSlide[];
  locale: Locale;
  base: string;
};

export function HomeSpotlightSlider({ slides, locale, base }: HomeSpotlightSliderProps) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const total = slides.length;
  const single = total <= 1;

  const go = useCallback(
    (delta: number) => {
      setIndex((current) => (current + delta + total) % total);
    },
    [total],
  );

  useEffect(() => {
    if (total <= 1) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        go(1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [go, total]);

  if (total === 0) return null;

  const trackStyle = {
    "--spotlight-index": index,
  } as CSSProperties;

  return (
    <div className={`home-spotlight${single ? " home-spotlight--single" : ""}`}>
      <div className="home-spotlight__stage">
        <div className="home-spotlight__track-outer">
          <div
            className="home-spotlight__track"
            style={trackStyle}
            aria-live="polite"
          >
            {slides.map((item, slideIndex) => {
              const isActive = slideIndex === index;
              const galleryTitle = localizedField(item.galleryTitle, locale);
              const alt = item.alt || galleryTitle || t("home.spotlight.imageAlt");
              const image = (
                <GalleryImage
                  src={item.imageUrl}
                  srcSet={item.imageSrcSet}
                  sizes={single ? "92vw" : "74vw"}
                  blurSrc={item.imageBlurUrl}
                  alt={alt}
                  className="home-spotlight__img"
                  objectPosition={item.imageObjectPosition}
                  loading={slideIndex <= 1 ? "eager" : "lazy"}
                  fetchPriority={slideIndex === 0 ? "high" : undefined}
                />
              );

              return (
                <div
                  key={item._key}
                  className={`home-spotlight__slide${isActive ? " is-active" : ""}`}
                >
                  {isActive ? (
                    <Link
                      to={`${base}/photography/${item.gallerySlug}`}
                      className="home-spotlight__image-link"
                      aria-label={galleryTitle || t("home.spotlight.openGallery")}
                    >
                      {image}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="home-spotlight__image-button"
                      onClick={() => setIndex(slideIndex)}
                      aria-label={t("home.spotlight.slideOf", {
                        current: slideIndex + 1,
                        total,
                      })}
                    >
                      {image}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {!single ? (
        <div className="home-spotlight__controls">
          <button
            type="button"
            className="home-spotlight__nav"
            onClick={() => go(-1)}
            aria-label={t("home.spotlight.prev")}
          >
            ←
          </button>
          <button
            type="button"
            className="home-spotlight__nav"
            onClick={() => go(1)}
            aria-label={t("home.spotlight.next")}
          >
            →
          </button>
        </div>
      ) : null}
    </div>
  );
}
