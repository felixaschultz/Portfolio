import { useCallback, useState } from "react";
import { Link } from "react-router";
import { GalleryImage } from "./GalleryImage";
import type { HomeFavoritePhoto } from "../lib/home-favorites";
import { favoriteCardCssVars } from "../lib/home-favorite-stack";
import { localizedField, type Locale } from "../lib/i18n";

type HomeFavoriteStackProps = {
  photos: HomeFavoritePhoto[];
  locale: Locale;
  base: string;
};

export function HomeFavoriteStack({ photos, locale, base }: HomeFavoriteStackProps) {
  const [expanded, setExpanded] = useState(false);

  const open = useCallback(() => setExpanded(true), []);
  const close = useCallback(() => setExpanded(false), []);

  if (photos.length === 0) return null;

  return (
    <div className="home-favorites" aria-label="Favorite photos">
      <div
        className={`home-favorites__stack${expanded ? " is-expanded" : ""}`}
        data-count={photos.length}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") open();
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") close();
        }}
        onFocusCapture={open}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            close();
          }
        }}
      >
        {photos.map((photo, index) => {
          const galleryTitle = localizedField(photo.galleryTitle, locale) || "Gallery";
          const alt = photo.alt || galleryTitle;
          return (
            <Link
              key={`${photo.gallerySlug}-${photo._key}`}
              to={`${base}/photography/${photo.gallerySlug}`}
              className="home-favorites__card group"
              style={{ zIndex: index + 1, ...favoriteCardCssVars(photo.stackPose, index, photos.length) }}
            >
              <GalleryImage
                src={photo.imageUrl}
                srcSet={photo.imageSrcSet}
                sizes="(max-width: 639px) 92vw, (max-width: 1023px) 58vw, 26rem"
                blurSrc={photo.imageBlurUrl}
                alt={alt}
                className="home-favorites__img"
                objectPosition={photo.imageObjectPosition}
                loading={index === 0 ? "eager" : "lazy"}
              />
              <div className="home-favorites__shade" aria-hidden />
              <div className="home-favorites__meta">
                <span className="home-favorites__index">{index + 1}</span>
                <span className="home-favorites__caption">{galleryTitle}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
