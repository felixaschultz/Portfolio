import { Link } from "react-router";
import { GalleryImage } from "./GalleryImage";
import type { HomeSelectedWorkPhoto } from "../lib/home-selected-work";
import { localizedField, type Locale } from "../lib/i18n";

type HomeSelectedWorkProps = {
  photos: HomeSelectedWorkPhoto[];
  locale: Locale;
  base: string;
};

export function HomeSelectedWork({ photos, locale, base }: HomeSelectedWorkProps) {
  if (photos.length === 0) return null;

  return (
    <div className="home-selected-work__grid">
      {photos.map((photo, index) => {
        const galleryTitle = localizedField(photo.galleryTitle, locale) || "Gallery";
        const alt = photo.alt || galleryTitle;
        return (
          <Link
            key={`${photo.gallerySlug}-${photo._key}`}
            to={`${base}/photography/${photo.gallerySlug}`}
            className="home-selected-work__item group"
          >
            <GalleryImage
              src={photo.imageUrl}
              srcSet={photo.imageSrcSet}
              sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 22rem"
              blurSrc={photo.imageBlurUrl}
              alt={alt}
              className="home-selected-work__img"
              objectPosition={photo.imageObjectPosition}
              scale={photo.imageScale}
              loading={index < 4 ? "eager" : "lazy"}
            />
            <div className="home-selected-work__shade" aria-hidden />
            <span className="home-selected-work__caption">{galleryTitle}</span>
          </Link>
        );
      })}
    </div>
  );
}
