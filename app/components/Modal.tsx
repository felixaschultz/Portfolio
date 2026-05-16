import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useBodyScrollLock } from "../lib/useBodyScrollLock";

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
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = panel.querySelector<HTMLElement>(FOCUSABLE);
      (focusable ?? panel).focus();
    });

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[10000] flex ${positionClassName}`}
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-black/75 backdrop-blur-sm"
        aria-label="Close"
        tabIndex={-1}
        onClick={() => onCloseRef.current()}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy ?? (ariaLabel ? undefined : titleId)}
        tabIndex={-1}
        className={`relative z-10 mx-auto w-full max-h-[100dvh] overflow-y-auto overscroll-contain outline-none sm:max-h-[min(90dvh,720px)] ${panelClassName}`}
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
