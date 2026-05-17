import { useMemo, type ReactNode } from "react";
import { buildMasonryColumns, type MosaicImage } from "../lib/gallery-mosaic";

type GalleryMasonryProps<T extends MosaicImage> = {
  images: T[];
  seed: string;
  className?: string;
  renderItem: (image: T, index: number) => ReactNode;
};

function MasonryColumns<T extends MosaicImage>({
  columnBuckets,
  images,
  renderItem,
  className,
}: {
  columnBuckets: number[][];
  images: T[];
  renderItem: (image: T, index: number) => ReactNode;
  className: string;
}) {
  return (
    <div className={className}>
      {columnBuckets.map((indices, colIdx) => (
        <div key={colIdx} className="gallery-mosaic__col">
          {indices.map((imageIndex) => renderItem(images[imageIndex], imageIndex))}
        </div>
      ))}
    </div>
  );
}

export function GalleryMasonry<T extends MosaicImage>({
  images,
  seed,
  className = "",
  renderItem,
}: GalleryMasonryProps<T>) {
  const desktopCols = useMemo(() => buildMasonryColumns(images, 3, seed), [images, seed]);
  const tabletCols = useMemo(() => buildMasonryColumns(images, 2, `${seed}-tablet`), [images, seed]);
  const mobileCols = useMemo(() => buildMasonryColumns(images, 1, `${seed}-mobile`), [images, seed]);

  const base = `gallery-mosaic ${className}`.trim();

  return (
    <>
      <MasonryColumns
        columnBuckets={desktopCols}
        images={images}
        renderItem={renderItem}
        className={`${base} gallery-mosaic--desktop`}
      />
      <MasonryColumns
        columnBuckets={tabletCols}
        images={images}
        renderItem={renderItem}
        className={`${base} gallery-mosaic--tablet`}
      />
      <MasonryColumns
        columnBuckets={mobileCols}
        images={images}
        renderItem={renderItem}
        className={`${base} gallery-mosaic--mobile`}
      />
    </>
  );
}
