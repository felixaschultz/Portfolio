import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { PhotoDetail } from "../lib/photos";
import { localizedField, type Locale } from "../lib/i18n";

type PhotoLightboxProps = {
  photo: PhotoDetail;
};

export function PhotoLightbox({ photo }: PhotoLightboxProps) {
  const { locale } = useParams();
  const { t } = useTranslation();
  const lng = (locale ?? "da") as Locale;
  const base = `/${locale}`;
  const title = localizedField(photo.title, lng) || "Photo";
  const caption = localizedField(photo.caption, lng);

  return (
    <article className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <Link
        to={`${base}/photography`}
        className="mb-8 inline-flex text-sm text-[var(--color-accent)] hover:underline"
      >
        ← {t("photography.back")}
      </Link>
      <figure>
        <img
          src={photo.imageUrl}
          srcSet={photo.imageSrcSet}
          sizes="100vw"
          alt={title}
          className="w-full rounded-2xl border border-[var(--color-border)] object-contain"
        />
        <figcaption className="mt-6 space-y-2">
          <h1 className="font-display text-3xl font-semibold">{title}</h1>
          {caption && <p className="text-[var(--color-muted)]">{caption}</p>}
          <p className="text-sm text-[var(--color-muted)]">
            {[photo.location, photo.takenAt].filter(Boolean).join(" · ")}
          </p>
        </figcaption>
      </figure>
    </article>
  );
}
