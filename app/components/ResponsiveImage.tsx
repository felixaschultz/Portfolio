type ResponsiveImageProps = {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt?: string;
  className?: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  decoding?: "async" | "sync" | "auto";
};

export function ResponsiveImage({
  src,
  srcSet,
  sizes,
  alt = "",
  className,
  loading = "lazy",
  fetchPriority,
  decoding = "async",
}: ResponsiveImageProps) {
  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={className}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding={decoding}
    />
  );
}
