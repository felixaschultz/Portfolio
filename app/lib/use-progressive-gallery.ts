import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import {
  GALLERY_BATCH_SIZE,
  INITIAL_GALLERY_BATCH,
  needsProgressiveLoading,
} from "./gallery-performance";

/**
 * Caps how many stream images are mounted at once; grows when the sentinel nears the viewport.
 */
export function useProgressiveImageCount(total: number): {
  visibleCount: number;
  sentinelRef: RefObject<HTMLDivElement | null>;
} {
  const progressive = needsProgressiveLoading(total);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(() =>
    progressive ? Math.min(INITIAL_GALLERY_BATCH, total) : total,
  );

  useEffect(() => {
    setVisibleCount(progressive ? Math.min(INITIAL_GALLERY_BATCH, total) : total);
  }, [total, progressive]);

  const loadMore = useCallback(() => {
    setVisibleCount((count) => Math.min(total, count + GALLERY_BATCH_SIZE));
  }, [total]);

  useEffect(() => {
    if (!progressive || visibleCount >= total) return;

    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "900px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [progressive, visibleCount, total, loadMore]);

  return { visibleCount, sentinelRef };
}
