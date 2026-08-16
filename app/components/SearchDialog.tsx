import { matchSorter } from "match-sorter";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import type { Locale } from "../lib/i18n";
import type { SearchIndexItem } from "../lib/search";
import { Modal } from "./Modal";

type SearchDialogProps = {
  locale: Locale;
  open: boolean;
  onClose: () => void;
};

export function SearchDialog({ locale, open, onClose }: SearchDialogProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isPhotographySection = location.pathname.includes("/photography");
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [items, setItems] = useState<SearchIndexItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    setItems([]);
    setLoadError(false);
  }, [locale]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);
    setLoadError(false);

    void fetch(`/api/search/${locale}`)
      .then((res) => {
        if (!res.ok) throw new Error("search index failed");
        return res.json() as Promise<SearchIndexItem[]>;
      })
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, locale]);

  const results = useMemo(() => {
    const list = items ?? [];
    let matched: SearchIndexItem[];
    if (!query.trim()) {
      matched = list.slice(0, 12);
    } else {
      matched = matchSorter(list, query.trim(), {
        keys: ["title", "excerpt", "keywords", "type"],
        threshold: matchSorter.rankings.CONTAINS,
      }).slice(0, 12);
    }
    if (isPhotographySection) {
      const galleries = matched.filter((i) => i.type === "gallery");
      const rest = matched.filter((i) => i.type !== "gallery");
      return [...galleries, ...rest];
    }
    return matched;
  }, [items, query, isPhotographySection]);

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
  }, [open, results, activeIndex, goTo]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      ariaLabel={t("search.title")}
      positionClassName="modal-overlay--responsive"
      panelClassName="max-w-xl overflow-hidden rounded-t-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-2xl sm:rounded-2xl"
    >
      <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3">
        <span className="hidden text-[var(--color-muted)] sm:inline" aria-hidden>
          ⌘K
        </span>
        <span className="text-[var(--color-muted)] sm:hidden" aria-hidden>
          ⌕
        </span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isPhotographySection ? t("search.placeholderPhotography") : t("search.placeholder")}
          className="min-h-11 flex-1 bg-transparent text-base text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)] sm:text-sm"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 shrink-0 px-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
        >
          {t("search.close")}
        </button>
      </div>

      <ul className="max-h-[min(50vh,400px)] overflow-y-auto p-2">
        {loading ? (
          <li className="px-3 py-6 text-center text-sm text-[var(--color-muted)]">
            {t("search.loading")}
          </li>
        ) : loadError ? (
          <li className="px-3 py-6 text-center text-sm text-[var(--color-muted)]">
            {t("search.loadError")}
          </li>
        ) : results.length === 0 ? (
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
    </Modal>
  );
}
