import { useEffect, useId, useRef, useState } from "react";
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

export function Modal({
  open,
  onClose,
  children,
  panelClassName = "",
  positionClassName = "modal-overlay--center",
  ariaLabel,
  ariaLabelledBy,
}: ModalProps) {
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [mounted, setMounted] = useState(false);

  useBodyScrollLock(open);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!mounted || !open) return null;

  const labelledBy = ariaLabelledBy ?? (ariaLabel ? undefined : titleId);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      aria-labelledby={labelledBy}
      className={`modal-overlay ${positionClassName}`}
    >
      <button
        type="button"
        className="modal-overlay__backdrop"
        aria-label="Close dialog"
        onClick={() => onCloseRef.current()}
      />
      <div className={`modal-panel ${panelClassName}`}>
        {!ariaLabel && !ariaLabelledBy ? (
          <span id={titleId} className="sr-only">
            Dialog
          </span>
        ) : null}
        {children}
      </div>
    </div>,
    document.body,
  );
}
