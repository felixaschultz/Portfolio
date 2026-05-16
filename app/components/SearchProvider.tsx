import { useCallback, useEffect, useState } from "react";
import type { SearchIndexItem } from "../lib/search.server";
import { SearchDialog } from "./SearchDialog";

type SearchProviderProps = {
  items: SearchIndexItem[];
  children: React.ReactNode;
};

export function SearchProvider({ items, children }: SearchProviderProps) {
  const [open, setOpen] = useState(false);

  const openSearch = useCallback(() => setOpen(true), []);
  const closeSearch = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    (window as Window & { __openPortfolioSearch?: () => void }).__openPortfolioSearch =
      openSearch;
    return () => {
      delete (window as Window & { __openPortfolioSearch?: () => void })
        .__openPortfolioSearch;
    };
  }, [openSearch]);

  return (
    <>
      {children}
      <SearchDialog open={open} onClose={closeSearch} items={items} />
    </>
  );
}

export function openSearchPalette() {
  (window as Window & { __openPortfolioSearch?: () => void }).__openPortfolioSearch?.();
}
