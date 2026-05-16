import { useEffect, useId, useRef, useState } from "react";
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      if (dialog.open) onCloseRef.current();
    };

    dialog.addEventListener("close", handleClose);
    dialog.addEventListener("cancel", handleClose);
    return () => {
      dialog.removeEventListener("close", handleClose);
      dialog.removeEventListener("cancel", handleClose);
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      className={`modal-overlay ${positionClassName}`}
      aria-modal="true"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy ?? (ariaLabel ? undefined : titleId)}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onCloseRef.current();
        }
      }}
    >
      <div
        className={`modal-panel ${panelClassName}`}
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
      >
        {!ariaLabel && !ariaLabelledBy ? (
          <span id={titleId} className="sr-only">
            Dialog
          </span>
        ) : null}
        {children}
      </div>
    </dialog>,
    document.body,
  );
}
