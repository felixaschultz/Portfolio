import { useTranslation } from "react-i18next";
import { recommendations } from "../lib/recommendations";

export function Recommendations() {
  const { t } = useTranslation();

  return (
    <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)] py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="font-display text-3xl font-semibold">{t("recommendations.title")}</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {recommendations.map((item) => (
            <blockquote
              key={item.author}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6"
            >
              <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                &ldquo;{item.recommend}&rdquo;
              </p>
              <footer className="mt-4 text-sm font-medium text-[var(--color-accent)]">
                — {item.author}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
