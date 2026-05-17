import type { CSSProperties, ReactNode } from "react";
import { useLazyInView } from "../lib/use-lazy-in-view";

type LazyGalleryTileProps = {
  children: ReactNode;
  width?: number;
  height?: number;
  className?: string;
};

export function LazyGalleryTile({ children, width, height, className = "" }: LazyGalleryTileProps) {
  const { ref, inView } = useLazyInView({ rootMargin: "600px 0px" });

  const style: CSSProperties | undefined =
    width && height ? { aspectRatio: `${width} / ${height}` } : undefined;

  return (
    <div ref={ref} className={`gallery-lazy-tile ${className}`.trim()} style={style}>
      {inView ? children : <span className="gallery-lazy-tile__placeholder" aria-hidden />}
    </div>
  );
}
