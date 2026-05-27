import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type TransitionEvent,
} from "react";
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

type ExtendedSlide = HomeSpotlightSlide & { trackKey: string };

function buildExtendedSlides(slides: HomeSpotlightSlide[], loops: number): ExtendedSlide[] {
  const out: ExtendedSlide[] = [];
  for (let copy = 0; copy < loops; copy += 1) {
    for (const slide of slides) {
      out.push({
        ...slide,
        trackKey: `${slide._key}-${copy}`,
      });
    }
  }
  return out;
}

export function HomeSpotlightSlider({ slides, locale, base }: HomeSpotlightSliderProps) {
  const { t } = useTranslation();
  const total = slides.length;
  const loop = total > 1;
  const single = !loop;

  const extendedSlides = useMemo(
    () => (loop ? buildExtendedSlides(slides, 3) : buildExtendedSlides(slides, 1)),
    [loop, slides],
  );

  const [position, setPosition] = useState(() => (loop ? total : 0));
  const [instant, setInstant] = useState(false);
  const positionRef = useRef(position);
  positionRef.current = position;

  useEffect(() => {
    const start = loop ? total : 0;
    setPosition(start);
    positionRef.current = start;
    setInstant(false);
  }, [loop, slides, total]);

  const jumpWithoutAnimation = useCallback((next: number) => {
    setInstant(true);
    positionRef.current = next;
    setPosition(next);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setInstant(false));
    });
  }, []);

  const go = useCallback(
    (delta: number) => {
      if (!loop) return;
      setPosition((current) => {
        const next = current + delta;
        positionRef.current = next;
        return next;
      });
    },
    [loop],
  );

  const onTrackTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLDivElement>) => {
      if (event.propertyName !== "transform" || instant) return;
      const current = positionRef.current;
      if (!loop) return;
      if (current >= total * 2) {
        jumpWithoutAnimation(current - total);
      } else if (current < total) {
        jumpWithoutAnimation(current + total);
      }
    },
    [instant, jumpWithoutAnimation, loop, total],
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
    "--spotlight-index": position,
  } as CSSProperties;

  return (
    <div className={`home-spotlight${single ? " home-spotlight--single" : ""}`}>
      <div className="home-spotlight__stage">
        <div className="home-spotlight__track-outer">
          <div
            className={`home-spotlight__track${instant ? " home-spotlight__track--instant" : ""}`}
            style={trackStyle}
            aria-live="polite"
            onTransitionEnd={onTrackTransitionEnd}
          >
            {extendedSlides.map((item, trackIndex) => {
              const isActive = trackIndex === position;
              const galleryTitle = localizedField(item.galleryTitle, locale);
              const alt = item.alt || galleryTitle || t("home.spotlight.imageAlt");
              const eager =
                loop &&
                (trackIndex === position ||
                  trackIndex === position - 1 ||
                  trackIndex === position + 1);
              const image = (
                <GalleryImage
                  src={item.imageUrl}
                  srcSet={item.imageSrcSet}
                  sizes={single ? "100vw" : "88vw"}
                  blurSrc={item.imageBlurUrl}
                  alt={alt}
                  className="home-spotlight__img"
                  objectPosition={item.imageObjectPosition}
                  loading={eager || trackIndex < total ? "eager" : "lazy"}
                  fetchPriority={trackIndex === position ? "high" : undefined}
                />
              );

              return (
                <div
                  key={item.trackKey}
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
                      onClick={() => {
                        positionRef.current = trackIndex;
                        setPosition(trackIndex);
                      }}
                      aria-label={t("home.spotlight.slideOf", {
                        current: (trackIndex % total) + 1,
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

      {loop ? (
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
