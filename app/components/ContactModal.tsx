import { useState } from "react";
import { useTranslation } from "react-i18next";

type ContactModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ContactModal({ open, onClose }: ContactModalProps) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const res = await fetch(
        "https://www.intastellarsolutions.com/contact/send.php",
        { method: "POST", body: data },
      );
      setStatus(res.ok ? "success" : "error");
      if (res.ok) form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-[var(--color-muted)] hover:text-[var(--color-text)]"
          aria-label={t("contact.close")}
        >
          ✕
        </button>
        <h2 className="font-display text-2xl font-semibold">{t("contact.title")}</h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">{t("contact.description")}</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm text-[var(--color-muted)]">{t("contact.name")}</span>
            <input name="name" required className="input mt-1" />
          </label>
          <label className="block">
            <span className="text-sm text-[var(--color-muted)]">{t("contact.email")}</span>
            <input name="email" type="email" required className="input mt-1" />
          </label>
          <label className="block">
            <span className="text-sm text-[var(--color-muted)]">{t("contact.message")}</span>
            <textarea name="message" required rows={5} className="input mt-1 resize-y" />
          </label>
          <button type="submit" className="btn-primary w-full">
            {t("contact.submit")}
          </button>
          {status === "success" && (
            <p className="text-sm text-emerald-400">{t("contact.success")}</p>
          )}
          {status === "error" && (
            <p className="text-sm text-red-400">{t("contact.error")}</p>
          )}
        </form>
      </div>
    </div>
  );
}
