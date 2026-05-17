import type { DragEvent, ElementType, HTMLAttributes, MouseEvent, ReactNode } from "react";

type ProtectedGallerySurfaceProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  as?: ElementType;
};

/** Deters casual save / right-click / drag on gallery imagery (not foolproof). */
export function ProtectedGallerySurface({
  children,
  as: Tag = "div",
  className = "",
  ...rest
}: ProtectedGallerySurfaceProps) {
  return (
    <Tag
      className={`gallery-protected ${className}`.trim()}
      onContextMenu={(e: MouseEvent) => e.preventDefault()}
      onDragStart={(e: DragEvent) => e.preventDefault()}
      {...rest}
    >
      {children}
    </Tag>
  );
}
