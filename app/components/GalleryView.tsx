import { useCallback, useMemo } from "react";
import { Link, useLocation, useNavigate, useParams, useRouteLoaderData } from "react-router";
import { useTranslation } from "react-i18next";
import type { GalleryCategoryRef, GalleryDetail, GalleryImageItem, GalleryNavItem } from "../lib/galleries";
import { buildGalleryAlbumMetaLine } from "../lib/gallery-meta";
import { categoryLabel, photographyCategoryPath } from "../lib/gallery-categories";
import { photographyTagPath, tagToParam } from "../lib/gallery-tags";
import { localizedField, resolveSanityString, type Locale } from "../lib/i18n";
import { GalleryAlbumNav } from "./GalleryAlbumNav";
import { GalleryImage } from "./GalleryImage";
import { GalleryLightbox, useGalleryLightbox } from "./GalleryLightbox";
import { Reveal } from "./Reveal";
import { GalleryPublicShopLink } from "./GalleryPublicShopLink";
import { GalleryResponsiveLabel } from "./GalleryResponsiveLabel";
import { GalleryShare } from "./GalleryShare";
import { revealStagger } from "../lib/use-reveal-on-scroll";
import { shouldDisableReveal } from "../lib/gallery-performance";
import { pageUrl } from "../lib/seo";
import { GalleryMasonry } from "./GalleryMasonry";
import { LazyGalleryTile } from "./LazyGalleryTile";
import { ProtectedGallerySurface } from "./ProtectedGallerySurface";

type GalleryViewProps = {
  gallery: GalleryDetail;
  /** Pre-formatted in the route loader so SSR and hydration stay in sync. */
  metaLine?: string;
  nextGallery?: GalleryNavItem | null;
  prevGallery?: GalleryNavItem | null;
};

type AlbumPhotoProps = {
  image: GalleryImageItem;
  index: number;
  title: string;
  caption: string;
  onOpen: (key: string) => void;
  animate: boolean;
};

type GalleryDetailsProps = {
  description: string;
  categories: GalleryCategoryRef[];
  tags: string[];
  lng: Locale;
};

function GalleryDetails({ description, categories, tags, lng }: GalleryDetailsProps) {
  if (!description && tags.length === 0 && categories.length === 0) return null;

  return (
    <div className="gallery-album__details">
      {description ? <p className="gallery-album__description">{description}</p> : null}
      {categories.length > 0 ? (
        <p className="gallery-album__categories">
          {categories.map((category, i) => (
            <span key={category.slug}>
              {i > 0 ? <span className="gallery-album__tag-sep" aria-hidden> / </span> : null}
              <Link to={photographyCategoryPath(lng, category.slug)} className="gallery-album__tag">
                {categoryLabel(category, lng)}
              </Link>
            </span>
          ))}
        </p>
      ) : null}
      {tags.length > 0 ? (
        <p className="gallery-album__tags">
          {tags.map((tag, i) => (
            <span key={tagToParam(tag)}>
              {i > 0 ? <span className="gallery-album__tag-sep" aria-hidden> / </span> : null}
              <Link to={photographyTagPath(lng, tag)} className="gallery-album__tag">
                {tag}
              </Link>
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}

function AlbumPhoto({ image, index, title, caption, onOpen, animate }: AlbumPhotoProps) {
  const indexLabel = String(index + 1).padStart(2, "0");

  const tile = (
    <figure className="gallery-mosaic__item gallery-album__figure">
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
            loading={index < 3 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : undefined}
            protectedImage
          />
          <span className="gallery-protected__shield" aria-hidden />
          {caption ? (
            <span className="gallery-mosaic__caption" aria-hidden>
              {caption}
            </span>
          ) : null}
        </span>
      </button>
    </figure>
  );

  if (!animate) {
    return (
      <LazyGalleryTile width={image.width} height={image.height}>
        {tile}
      </LazyGalleryTile>
    );
  }

  return (
    <LazyGalleryTile width={image.width} height={image.height}>
      <Reveal as="div" className="gallery-album__reveal" variant="scale" delay={revealStagger(index, 60, 360)}>
        {tile}
      </Reveal>
    </LazyGalleryTile>
  );
}

export function GalleryView({
  gallery,
  metaLine: metaLineFromLoader,
  nextGallery = null,
  prevGallery = null,
}: GalleryViewProps) {
  const { locale: localeParam } = useParams();
  const parentLocale = useRouteLoaderData("routes/$locale") as { locale: Locale } | undefined;
  const lng = parentLocale?.locale ?? ((localeParam ?? "da") as Locale);
  const base = `/${lng}`;
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate(`${base}/photography`, { viewTransition: true });
    }
  }, [location.key, navigate, base]);
  const openPhoto = useGalleryLightbox();
  const title = localizedField(gallery.title, lng) || "Gallery";
  const description = localizedField(gallery.description, lng);
  const tags = gallery.tags?.filter((tag) => tag.trim()) ?? [];
  const categories = gallery.categories ?? [];

  const imageCaption = useCallback(
    (caption: GalleryImageItem["caption"]) => resolveSanityString(caption, lng),
    [lng],
  );

  const metaLine = metaLineFromLoader ?? buildGalleryAlbumMetaLine(gallery, lng, t);
  const streamAnimates = !shouldDisableReveal(gallery.images.length);

  const sharePayload = useMemo(
    () => ({
      url: pageUrl(lng, `/photography/${gallery.slug}`),
      title,
      text: description || metaLine,
    }),
    [lng, gallery.slug, title, description, metaLine],
  );

  return (
    <article className="gallery-album">
      {nextGallery?.coverUrl ? <link rel="preload" as="image" href={nextGallery.coverUrl} /> : null}
      {prevGallery?.coverUrl ? <link rel="preload" as="image" href={prevGallery.coverUrl} /> : null}

      <header className="gallery-album__masthead">
        <div className="gallery-album__intro-toolbar">
          <button type="button" onClick={handleBack} className="gallery-album__back gallery-album__back--plain">
            ←{" "}
            <GalleryResponsiveLabel
              short={t("photography.backShort")}
              long={t("photography.back")}
            />
          </button>
          <div className="gallery-album__toolbar-actions">
            <GalleryPublicShopLink shopUrl={gallery.shopUrl} variant="plain" />
            {gallery.flickrAlbumUrl ? (
              <a href={gallery.flickrAlbumUrl} target="_blank" rel="noopener noreferrer" className="gallery-album__flickr-link">
                Flickr
              </a>
            ) : null}
            <GalleryShare payload={sharePayload} />
          </div>
        </div>
        <h1 className="gallery-album__title mt-10">{title}</h1>
        {metaLine ? <p className="gallery-album__meta">{metaLine}</p> : null}
        <GalleryDetails description={description} categories={categories} tags={tags} lng={lng} />
      </header>

      {gallery.images.length > 0 ? (
        <ProtectedGallerySurface className="gallery-album__stream-wrap">
          <GalleryMasonry
            images={gallery.images}
            seed={gallery.slug}
            className="gallery-album__stream"
            renderItem={(image, index) => (
              <AlbumPhoto
                key={image._key}
                image={image}
                index={index}
                title={title}
                caption={imageCaption(image.caption)}
                onOpen={openPhoto}
                animate={streamAnimates}
              />
            )}
          />
        </ProtectedGallerySurface>
      ) : null}

      <GalleryAlbumNav nextGallery={nextGallery} prevGallery={prevGallery} />

      <GalleryLightbox images={gallery.images} albumTitle={title} captionFor={(img) => imageCaption(img.caption)} />
    </article>
  );
}
