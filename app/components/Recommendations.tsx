import { useState } from "react";
import { useTranslation } from "react-i18next";
import { recommendations } from "../lib/recommendations";

export function Recommendations() {
  const { t } = useTranslation();
  const total = recommendations.length;
  const [index, setIndex] = useState(0);

  const go = (delta: number) => {
    setIndex((current) => (current + delta + total) % total);
  };

  if (total === 0) return null;

  const current = recommendations[index]!;

  return (
    <section className="recommendations border-t border-[var(--color-border)] bg-[var(--color-surface)] py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="font-display text-center text-3xl font-semibold">{t("recommendations.title")}</h2>

        <div className="recommendations__slide" aria-live="polite">
          <blockquote key={index} className="recommendations__quote">
            <p className="recommendations__text">&ldquo;{current.recommend}&rdquo;</p>
            <footer className="recommendations__author">— {current.author}</footer>
          </blockquote>
        </div>

        {total > 1 ? (
          <div className="recommendations__controls">
            <button
              type="button"
              className="recommendations__nav"
              onClick={() => go(-1)}
              aria-label={t("recommendations.prev")}
            >
              ←
            </button>
            <div className="recommendations__dots" role="tablist" aria-label={t("recommendations.title")}>
              {recommendations.map((item, i) => (
                <button
                  key={item.author}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={t("recommendations.goTo", { n: i + 1 })}
                  className={`recommendations__dot${i === index ? " is-active" : ""}`}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
            <button
              type="button"
              className="recommendations__nav"
              onClick={() => go(1)}
              aria-label={t("recommendations.next")}
            >
              →
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
