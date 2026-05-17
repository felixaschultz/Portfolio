import { useMemo, type ReactNode } from "react";
import { buildMasonryColumns, type MosaicImage } from "../lib/gallery-mosaic";
import { useMasonryColumnCount } from "../lib/use-masonry-column-count";
import { useProgressiveImageCount } from "../lib/use-progressive-gallery";

type GalleryMasonryProps<T extends MosaicImage> = {
  images: T[];
  seed: string;
  className?: string;
  renderItem: (image: T, index: number) => ReactNode;
};

export function GalleryMasonry<T extends MosaicImage>({
  images,
  seed,
  className = "",
  renderItem,
}: GalleryMasonryProps<T>) {
  const columnCount = useMasonryColumnCount();
  const { visibleCount, sentinelRef } = useProgressiveImageCount(images.length);
  const visibleImages = useMemo(() => images.slice(0, visibleCount), [images, visibleCount]);

  const columnBuckets = useMemo(
    () => buildMasonryColumns(visibleImages, columnCount, `${seed}:${columnCount}`),
    [visibleImages, columnCount, seed],
  );

  const base = `gallery-mosaic ${className}`.trim();

  return (
    <>
      <div className={base}>
        {columnBuckets.map((indices, colIdx) => (
          <div key={colIdx} className="gallery-mosaic__col">
            {indices.map((imageIndex) => renderItem(visibleImages[imageIndex], imageIndex))}
          </div>
        ))}
      </div>
      {visibleCount < images.length ? (
        <div ref={sentinelRef} className="gallery-mosaic__sentinel" aria-hidden />
      ) : null}
    </>
  );
}
