import { useState } from "react";
import { useTranslation } from "react-i18next";

export function ContactForm() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

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
    <form onSubmit={handleSubmit} className="space-y-4">
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
  );
}
