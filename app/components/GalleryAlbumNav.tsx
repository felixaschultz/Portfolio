import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { GalleryNavItem } from "../lib/galleries";
import { localizedField, type Locale } from "../lib/i18n";
import { GalleryImage } from "./GalleryImage";
import { Reveal } from "./Reveal";

type GalleryAlbumNavProps = {
  nextGallery: GalleryNavItem | null;
  prevGallery: GalleryNavItem | null;
};

function NavCard({
  gallery,
  direction,
  label,
}: {
  gallery: GalleryNavItem;
  direction: "prev" | "next";
  label: string;
}) {
  const { locale } = useParams();
  const lng = (locale ?? "da") as Locale;
  const base = `/${locale}`;
  const title = localizedField(gallery.title, lng);

  return (
    <Link
      to={`${base}/photography/${gallery.slug}`}
      className={`gallery-album__nav-link ${direction === "next" ? "gallery-album__nav-link--next" : ""}`}
      viewTransition
      prefetch="intent"
    >
      <span className="gallery-album__nav-label">{label}</span>
      <span className="gallery-album__nav-body">
        <span className="gallery-album__nav-visual">
          <GalleryImage
            src={gallery.coverUrl}
            srcSet={gallery.coverSrcSet}
            sizes="(max-width: 767px) 40vw, 12rem"
            blurSrc={gallery.coverBlurUrl}
            alt=""
            loading="lazy"
            className="gallery-album__nav-img"
          />
        </span>
        <span className="gallery-album__nav-title">{title}</span>
      </span>
    </Link>
  );
}

export function GalleryAlbumNav({ nextGallery, prevGallery }: GalleryAlbumNavProps) {
  const { t } = useTranslation();

  if (!nextGallery && !prevGallery) return null;

  return (
    <nav className="gallery-album__nav" aria-label={t("photography.albumNavLabel")}>
      {prevGallery ? (
        <Reveal variant="fade" className="gallery-album__nav-item">
          <NavCard gallery={prevGallery} direction="prev" label={t("photography.prevAlbum")} />
        </Reveal>
      ) : (
        <div className="gallery-album__nav-item gallery-album__nav-item--empty" aria-hidden />
      )}
      {nextGallery ? (
        <Reveal variant="fade" delay={80} className="gallery-album__nav-item">
          <NavCard gallery={nextGallery} direction="next" label={t("photography.nextAlbum")} />
        </Reveal>
      ) : null}
    </nav>
  );
}
