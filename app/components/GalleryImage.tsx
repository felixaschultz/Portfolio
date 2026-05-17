import { useState } from "react";

type GalleryImageProps = {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  blurSrc?: string;
  className?: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
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
}: GalleryImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <span className={`gallery-image ${loaded ? "gallery-image--loaded" : ""}`}>
      {blurSrc ? (
        <img src={blurSrc} alt="" className="gallery-image__blur" aria-hidden decoding="async" />
      ) : null}
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        className={`gallery-image__main ${className}`.trim()}
        onLoad={() => setLoaded(true)}
      />
    </span>
  );
}
