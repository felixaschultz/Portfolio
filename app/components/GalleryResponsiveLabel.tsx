type GalleryResponsiveLabelProps = {
  short: string;
  long: string;
  className?: string;
};

/** Shows `short` below 640px and `long` from sm breakpoint up. */
export function GalleryResponsiveLabel({
  short,
  long,
  className = "gallery-album__responsive-label",
}: GalleryResponsiveLabelProps) {
  return (
    <span className={className}>
      <span className="gallery-album__responsive-label__short">{short}</span>
      <span className="gallery-album__responsive-label__long">{long}</span>
    </span>
  );
}
