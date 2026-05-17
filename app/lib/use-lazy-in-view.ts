import { useEffect, useRef, useState } from "react";

type UseLazyInViewOptions = {
  rootMargin?: string;
  /** Keep observing after first show (default: disconnect once visible). */
  persist?: boolean;
};

export function useLazyInView(options: UseLazyInViewOptions = {}) {
  const { rootMargin = "500px 0px", persist = false } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || (inView && !persist)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (!persist) observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [inView, persist, rootMargin]);

  return { ref, inView };
}
