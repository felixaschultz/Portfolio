import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  panelClassName?: string;
  positionClassName?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getModalRoot(): HTMLElement {
  return document.getElementById("modal-root") ?? document.body;
}

export function Modal({
  open,
  onClose,
  children,
  panelClassName = "",
  positionClassName = "items-end sm:items-center justify-center p-0 sm:p-4",
  ariaLabel,
  ariaLabelledBy,
}: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const appRoot = document.getElementById("root-app");
    const prevAriaHidden = appRoot?.getAttribute("aria-hidden") ?? null;
    appRoot?.setAttribute("aria-hidden", "true");

    requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelector<HTMLElement>(FOCUSABLE);
      (focusable ?? panel).focus();
    });

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      if (!appRoot) return;
      if (prevAriaHidden === null) appRoot.removeAttribute("aria-hidden");
      else appRoot.setAttribute("aria-hidden", prevAriaHidden);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[10000] flex touch-manipulation ${positionClassName}`}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy ?? (ariaLabel ? undefined : titleId)}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" aria-hidden />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`relative z-10 mx-auto w-full max-h-[100dvh] overflow-y-auto overscroll-contain outline-none sm:max-h-[min(90dvh,720px)] ${panelClassName}`}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {!ariaLabel && !ariaLabelledBy ? (
          <span id={titleId} className="sr-only">
            Dialog
          </span>
        ) : null}
        {children}
      </div>
    </div>,
    getModalRoot(),
  );
}
