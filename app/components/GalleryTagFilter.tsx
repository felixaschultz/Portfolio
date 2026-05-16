import { useTranslation } from "react-i18next";
import { tagToParam } from "../lib/gallery-tags";

type GalleryTagFilterProps = {
  tags: string[];
  activeTag: string | null;
  onSelect: (tag: string | null) => void;
};

function filterButtonClass(selected: boolean): string {
  return selected
    ? "bg-[var(--color-accent)] text-[#0a0f0e]"
    : "border border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-text)]";
}

export function GalleryTagFilter({ tags, activeTag, onSelect }: GalleryTagFilterProps) {
  const { t } = useTranslation();

  if (tags.length === 0) return null;

  return (
    <nav
      className="lg:sticky lg:top-24"
      role="group"
      aria-label={t("photography.filterLabel")}
    >
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
        {t("photography.filterLabel")}
      </p>
      <ul className="flex flex-col gap-1.5">
        <li>
          <button
            type="button"
            onClick={() => onSelect(null)}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${filterButtonClass(activeTag === null)}`}
            aria-pressed={activeTag === null}
          >
            {t("photography.filterAll")}
          </button>
        </li>
        {tags.map((tag) => {
          const selected = activeTag !== null && tagToParam(activeTag) === tagToParam(tag);
          return (
            <li key={tagToParam(tag)}>
              <button
                type="button"
                onClick={() => onSelect(tag)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${filterButtonClass(selected)}`}
                aria-pressed={selected}
              >
                {tag}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
