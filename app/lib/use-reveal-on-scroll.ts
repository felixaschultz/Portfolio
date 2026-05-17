import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "./prefers-reduced-motion";

type UseRevealOnScrollOptions = {
  /** Skip animation and show content immediately (e.g. above-the-fold). */
  immediate?: boolean;
  threshold?: number;
  rootMargin?: string;
};

export function useRevealOnScroll<T extends HTMLElement = HTMLDivElement>(
  options: UseRevealOnScrollOptions = {},
) {
  const { immediate = false, threshold = 0.12, rootMargin = "0px 0px -6% 0px" } = options;
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(immediate);

  useEffect(() => {
    if (immediate) {
      setVisible(true);
      return;
    }

    if (prefersReducedMotion()) {
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [immediate, threshold, rootMargin]);

  return { ref, visible };
}

/** Stagger delay for list items (ms), capped so long lists do not wait too long. */
export function revealStagger(index: number, step = 90, max = 480): number {
  return Math.min(index * step, max);
}
