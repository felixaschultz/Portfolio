import { matchSorter } from "match-sorter";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import type { SearchIndexItem } from "../lib/search.server";

type SearchDialogProps = {
  open: boolean;
  onClose: () => void;
  items: SearchIndexItem[];
};

export function SearchDialog({ open, onClose, items }: SearchDialogProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(() => {
    if (!query.trim()) return items.slice(0, 12);
    return matchSorter(items, query.trim(), {
      keys: ["title", "excerpt", "keywords", "type"],
      threshold: matchSorter.rankings.CONTAINS,
    }).slice(0, 12);
  }, [items, query]);

  const goTo = useCallback(
    (item: SearchIndexItem) => {
      navigate(item.href);
      onClose();
      setQuery("");
    },
    [navigate, onClose],
  );

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, Math.max(0, results.length - 1)));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && results[activeIndex]) {
        e.preventDefault();
        goTo(results[activeIndex]);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, results, activeIndex, goTo]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center bg-black/60 p-4 pt-[12vh] backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("search.title")}
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3">
          <span className="text-[var(--color-muted)]" aria-hidden>
            ⌘K
          </span>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search.placeholder")}
            className="flex-1 bg-transparent text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)]"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
          >
            {t("search.close")}
          </button>
        </div>

        <ul className="max-h-[min(50vh,400px)] overflow-y-auto p-2">
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-[var(--color-muted)]">
              {t("search.noResults")}
            </li>
          ) : (
            results.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => goTo(item)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex w-full flex-col gap-0.5 rounded-xl px-3 py-2.5 text-left transition ${
                    index === activeIndex
                      ? "bg-[var(--color-accent-soft)] text-[var(--color-text)]"
                      : "text-[var(--color-muted)] hover:bg-[var(--color-accent-soft)]/50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-accent)]">
                      {t(`search.types.${item.type}`)}
                    </span>
                    <span className="font-medium text-[var(--color-text)]">{item.title}</span>
                  </span>
                  {item.excerpt ? (
                    <span className="line-clamp-1 text-sm">{item.excerpt}</span>
                  ) : null}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
