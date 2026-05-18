import { useCallback, useLayoutEffect, useRef, useState } from "react";

type GalleryImageProps = {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  blurSrc?: string;
  className?: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  /** Deters drag / context menu on the image node. */
  protectedImage?: boolean;
};

export function GalleryImage({
  src,
  srcSet,
  sizes,
  alt,
  blurSrc,
  className = "",
  loading = "lazy",
  fetchPriority,
  protectedImage = false,
}: GalleryImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const mountedRef = useRef(false);

  useLayoutEffect(() => {
    mountedRef.current = true;
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  const markLoaded = useCallback(() => {
    if (mountedRef.current) setLoaded(true);
  }, []);

  const protectClass = protectedImage ? " gallery-image--protected" : "";

  return (
    <span
      className={`gallery-image ${loaded ? "gallery-image--loaded" : ""}${protectClass}`}
      suppressHydrationWarning
      onContextMenu={protectedImage ? (e) => e.preventDefault() : undefined}
    >
      {blurSrc ? (
        <img
          src={blurSrc}
          alt=""
          className="gallery-image__blur"
          aria-hidden
          decoding="async"
          draggable={false}
        />
      ) : null}
      <img
        ref={imgRef}
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        draggable={false}
        className={`gallery-image__main ${className}`.trim()}
        onLoad={markLoaded}
        onContextMenu={protectedImage ? (e) => e.preventDefault() : undefined}
        onDragStart={protectedImage ? (e) => e.preventDefault() : undefined}
      />
    </span>
  );
}
