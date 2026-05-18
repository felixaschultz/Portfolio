import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  canUseNativeShare,
  copyToClipboard,
  shareNative,
  shareToEmail,
  shareToFacebook,
  shareToLinkedIn,
  shareToWhatsApp,
  shareToX,
  type SharePayload,
} from "../lib/share";

type GalleryShareProps = {
  payload: SharePayload;
  className?: string;
};

type ShareItem =
  | { id: string; labelKey: string; href?: string; action?: "copy" | "native"; external?: boolean };

export function GalleryShare({ payload, className = "" }: GalleryShareProps) {
  const { t } = useTranslation();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [nativeShare, setNativeShare] = useState(false);

  useEffect(() => {
    setNativeShare(canUseNativeShare());
  }, []);

  const items: ShareItem[] = useMemo(
    () => [
      ...(nativeShare
        ? [{ id: "native", labelKey: "photography.shareNative", action: "native" as const }]
        : []),
      { id: "copy", labelKey: copied ? "photography.shareCopied" : "photography.shareCopy", action: "copy" },
      { id: "facebook", labelKey: "photography.shareFacebook", href: shareToFacebook(payload.url), external: true },
      { id: "x", labelKey: "photography.shareX", href: shareToX(payload.url, payload.title), external: true },
      {
        id: "linkedin",
        labelKey: "photography.shareLinkedIn",
        href: shareToLinkedIn(payload.url),
        external: true,
      },
      {
        id: "whatsapp",
        labelKey: "photography.shareWhatsApp",
        href: shareToWhatsApp(payload.url, payload.title),
        external: true,
      },
      {
        id: "email",
        labelKey: "photography.shareEmail",
        href: shareToEmail(payload.url, payload.title, payload.text),
        external: true,
      },
    ],
    [copied, nativeShare, payload],
  );

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function handleItem(item: ShareItem) {
    if (item.action === "native") {
      await shareNative(payload);
      close();
      return;
    }
    if (item.action === "copy") {
      const ok = await copyToClipboard(payload.url);
      if (ok) setCopied(true);
      close();
    }
  }

  return (
    <div ref={rootRef} className={`gallery-share ${className}`.trim()}>
      <button
        type="button"
        className="gallery-share__trigger"
        aria-label={t("photography.share")}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open ? (
        <ul id={menuId} className="gallery-share__menu" role="menu">
          {items.map((item) => (
            <li key={item.id} role="none">
              {item.href ? (
                <a
                  href={item.href}
                  role="menuitem"
                  className="gallery-share__item"
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  onClick={() => close()}
                >
                  {t(item.labelKey)}
                </a>
              ) : (
                <button type="button" role="menuitem" className="gallery-share__item" onClick={() => handleItem(item)}>
                  {t(item.labelKey)}
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
