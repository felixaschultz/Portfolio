import { useCallback, useMemo } from "react";
import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { GalleryDetail, GalleryImageItem, GalleryNavItem } from "../lib/galleries";
import { formatGalleryDate } from "../lib/format-gallery-date";
import { photographyTagPath, tagToParam } from "../lib/gallery-tags";
import { localizedField, resolveSanityString, type Locale } from "../lib/i18n";
import { GalleryAlbumNav } from "./GalleryAlbumNav";
import { GalleryImage } from "./GalleryImage";
import { GalleryLightbox, useGalleryLightbox } from "./GalleryLightbox";
import { Reveal } from "./Reveal";
import { GalleryShare } from "./GalleryShare";
import { revealStagger } from "../lib/use-reveal-on-scroll";
import { pageUrl } from "../lib/seo";

type GalleryViewProps = {
  gallery: GalleryDetail;
  nextGallery?: GalleryNavItem | null;
  prevGallery?: GalleryNavItem | null;
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
  title: string;
  caption: string;
  onOpen: (key: string) => void;
};

function AlbumPhoto({ image, index, title, caption, onOpen }: AlbumPhotoProps) {
  const indexLabel = String(index + 1).padStart(2, "0");

  return (
    <Reveal
      as="figure"
      className="gallery-album__figure"
      variant="scale"
      delay={revealStagger(index, 60, 360)}
    >
      <button
        type="button"
        className="gallery-album__shot"
        onClick={() => onOpen(image._key)}
        aria-label={caption || `${title} — ${indexLabel}`}
      >
        <span className="gallery-album__frame">
          <GalleryImage
            src={image.imageUrl}
            srcSet={image.imageSrcSet}
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
            alt={image.alt || title}
            blurSrc={image.imageBlurUrl}
            className="gallery-album__img"
            loading="lazy"
          />
        </span>
      </button>
      {caption ? <figcaption className="gallery-album__caption">{caption}</figcaption> : null}
    </Reveal>
  );
}

export function GalleryView({ gallery, nextGallery = null, prevGallery = null }: GalleryViewProps) {
  const { locale } = useParams();
  const { t } = useTranslation();
  const lng = (locale ?? "da") as Locale;
  const base = `/${locale}`;
  const openPhoto = useGalleryLightbox();
  const title = localizedField(gallery.title, lng) || "Gallery";
  const description = localizedField(gallery.description, lng);
  const dateLabel = formatGalleryDate(gallery.takenAt, lng);
  const tags = gallery.tags?.filter((tag) => tag.trim()) ?? [];

  const coverImage = useMemo(() => resolveCoverImage(gallery), [gallery]);
  const moreImages = useMemo(() => {
    if (!coverImage) return gallery.images;
    return gallery.images.filter((img) => img._key !== coverImage._key);
  }, [gallery.images, coverImage]);

  const imageCaption = useCallback(
    (caption: GalleryImageItem["caption"]) => resolveSanityString(caption, lng),
    [lng],
  );

  const metaParts = [dateLabel, gallery.location, t("photography.photoCount", { count: gallery.imageCount })].filter(
    Boolean,
  );

  const coverIndex = coverImage
    ? gallery.images.findIndex((img) => img._key === coverImage._key)
    : 0;

  const sharePayload = useMemo(
    () => ({
      url: pageUrl(lng, `/photography/${gallery.slug}`),
      title,
      text: description || metaParts.join(" · "),
    }),
    [lng, gallery.slug, title, description, metaParts],
  );

  return (
    <article className="gallery-album">
      {coverImage ? (
        <section className="gallery-album__hero">
          <button
            type="button"
            className="gallery-album__hero-media"
            onClick={() => openPhoto(coverImage._key)}
            aria-label={title}
          >
            <GalleryImage
              src={coverImage.imageUrl}
              srcSet={coverImage.imageSrcSet}
              sizes="100vw"
              alt={coverImage.alt || title}
              blurSrc={coverImage.imageBlurUrl ?? gallery.coverBlurUrl}
              className="gallery-album__hero-img"
              loading="eager"
              fetchPriority="high"
            />
            <div className="gallery-album__hero-shade" aria-hidden />
          </button>

          <div className="gallery-album__hero-toolbar">
            <Link to={`${base}/photography`} className="gallery-album__back gallery-album__back--on-cover">
              ← {t("photography.back")}
            </Link>
            <GalleryShare payload={sharePayload} />
          </div>

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
          <div className="gallery-album__intro-toolbar">
            <Link to={`${base}/photography`} className="gallery-album__back gallery-album__back--plain">
              ← {t("photography.back")}
            </Link>
            <GalleryShare payload={sharePayload} />
          </div>
          <h1 className="gallery-album__title mt-10">{title}</h1>
          {metaParts.length > 0 ? <p className="gallery-album__meta">{metaParts.join(" · ")}</p> : null}
        </header>
      )}

      {(description || tags.length > 0) && (
        <Reveal
          className={`gallery-album__intro ${coverImage ? "border-t border-[var(--color-border)]" : ""}`}
          variant="fade"
          immediate
        >
          {description ? <p className="gallery-album__description">{description}</p> : null}
          {tags.length > 0 ? (
            <p className="gallery-album__tags">
              {tags.map((tag, i) => (
                <span key={tagToParam(tag)}>
                  {i > 0 ? <span className="text-[var(--color-border)]"> / </span> : null}
                  <Link
                    to={photographyTagPath(lng, tag)}
                    className="gallery-album__tag"
                  >
                    {tag}
                  </Link>
                </span>
              ))}
            </p>
          ) : null}
        </Reveal>
      )}

      {moreImages.length > 0 ? (
        <div className="gallery-album__stream">
          {moreImages.map((image, index) => (
            <AlbumPhoto
              key={image._key}
              image={image}
              index={coverImage ? index + 1 : index}
              title={title}
              caption={imageCaption(image.caption)}
              onOpen={openPhoto}
            />
          ))}
        </div>
      ) : null}

      <GalleryAlbumNav nextGallery={nextGallery} prevGallery={prevGallery} />

      <GalleryLightbox images={gallery.images} albumTitle={title} captionFor={(img) => imageCaption(img.caption)} />
    </article>
  );
}
