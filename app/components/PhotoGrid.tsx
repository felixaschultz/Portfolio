import { Link, useParams } from "react-router";
import type { PhotoListItem } from "../lib/photos";
import { localizedField, type Locale } from "../lib/i18n";

type PhotoGridProps = {
  photos: PhotoListItem[];
};

export function PhotoGrid({ photos }: PhotoGridProps) {
  const { locale } = useParams();
  const lng = (locale ?? "da") as Locale;
  const base = `/${locale}`;

  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
      {photos.map((photo) => {
        const title = localizedField(photo.title, lng) || "Photo";
        return (
          <Link
            key={photo._id}
            to={`${base}/photography/${photo.slug}`}
            className="group mb-4 block break-inside-avoid overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]"
          >
            <img
              src={photo.imageUrl}
              srcSet={photo.imageSrcSet}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              alt={title}
              className="w-full object-cover transition duration-500 group-hover:scale-[1.02]"
              loading="lazy"
            />
            <div className="p-4">
              <h3 className="font-display text-sm font-semibold">{title}</h3>
              {photo.location && (
                <p className="mt-1 text-xs text-[var(--color-muted)]">{photo.location}</p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
