import type { CSSProperties, ElementType, ReactNode } from "react";
import { useRevealOnScroll } from "../lib/use-reveal-on-scroll";

export type RevealVariant = "rise" | "fade" | "scale";

type RevealProps = {
  children: ReactNode;
  className?: string;
  variant?: RevealVariant;
  /** Transition delay in ms (use for staggered lists). */
  delay?: number;
  /** Show immediately without waiting for scroll (above-the-fold). */
  immediate?: boolean;
  as?: ElementType;
};

export function Reveal({
  children,
  className = "",
  variant = "rise",
  delay = 0,
  immediate = false,
  as: Tag = "div",
}: RevealProps) {
  const { ref, visible } = useRevealOnScroll<HTMLElement>({ immediate });
  const classes = [
    "reveal",
    `reveal--${variant}`,
    visible ? "reveal--visible" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const style = { "--reveal-delay": `${delay}ms` } as CSSProperties;

  return (
    <Tag ref={ref} className={classes} style={style}>
      {children}
    </Tag>
  );
}
