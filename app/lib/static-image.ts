/** Responsive static assets (e.g. project screenshots under /public). */

export type StaticImageVariant = {
  width: number;
  href: string;
  type?: string;
};

export function staticImageSrcSet(variants: StaticImageVariant[]): {
  src: string;
  srcSet: string;
} {
  const sorted = [...variants].sort((a, b) => a.width - b.width);
  const src = sorted[sorted.length - 1]?.href ?? "";
  const srcSet = sorted.map((v) => `${v.href} ${v.width}w`).join(", ");
  return { src, srcSet };
}

/** Intastellar Sign-in hero screenshot — WebP variants generated from the PNG master. */
export const INTASTELLAR_SIGNIN_COVER_VARIANTS: StaticImageVariant[] = [
  { width: 480, href: "/projects/intastellarsignin/cover-480.webp", type: "image/webp" },
  { width: 960, href: "/projects/intastellarsignin/cover-960.webp", type: "image/webp" },
  { width: 1200, href: "/projects/intastellarsignin/cover-1200.webp", type: "image/webp" },
];
