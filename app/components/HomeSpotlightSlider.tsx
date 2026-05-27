import { useCallback, useEffect, useState } from "react";
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
  const slide = slides[index];

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

  if (!slide) return null;

  const galleryTitle = localizedField(slide.galleryTitle, locale);
  const alt = slide.alt || galleryTitle || t("home.spotlight.imageAlt");

  return (
    <div className="home-spotlight">
      <div className="home-spotlight__viewport">
        <Link
          to={`${base}/photography/${slide.gallerySlug}`}
          className="home-spotlight__image-link"
          aria-label={galleryTitle || t("home.spotlight.openGallery")}
        >
          <GalleryImage
            key={slide._key}
            src={slide.imageUrl}
            srcSet={slide.imageSrcSet}
            sizes="(max-width: 1279px) 100vw, min(72rem, 92vw)"
            blurSrc={slide.imageBlurUrl}
            alt={alt}
            className="home-spotlight__img"
            objectPosition={slide.imageObjectPosition}
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : undefined}
          />
        </Link>

        {total > 1 ? (
          <>
            <button
              type="button"
              className="home-spotlight__nav home-spotlight__nav--prev"
              onClick={() => go(-1)}
              aria-label={t("home.spotlight.prev")}
            >
              ‹
            </button>
            <button
              type="button"
              className="home-spotlight__nav home-spotlight__nav--next"
              onClick={() => go(1)}
              aria-label={t("home.spotlight.next")}
            >
              ›
            </button>
            <div className="home-spotlight__dots" role="tablist" aria-label={t("home.spotlight.carousel")}>
              {slides.map((item, dotIndex) => (
                <button
                  key={item._key}
                  type="button"
                  role="tab"
                  aria-current={dotIndex === index ? "true" : undefined}
                  aria-label={t("home.spotlight.slideOf", {
                    current: dotIndex + 1,
                    total,
                  })}
                  className={`home-spotlight__dot${dotIndex === index ? " is-active" : ""}`}
                  onClick={() => setIndex(dotIndex)}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
