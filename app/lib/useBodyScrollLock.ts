import { useEffect } from "react";

let lockCount = 0;
let previousOverflow: string | null = null;

function lockBodyScroll() {
  if (lockCount === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  lockCount += 1;
}

function unlockBodyScroll() {
  if (lockCount <= 0) return;
  lockCount -= 1;
  if (lockCount === 0 && previousOverflow !== null) {
    document.body.style.overflow = previousOverflow;
    previousOverflow = null;
  }
}

/** Locks body scroll while `active` is true; safe when multiple overlays stack. */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [active]);
}
