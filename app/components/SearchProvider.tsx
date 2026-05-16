import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { SearchIndexItem } from "../lib/search";
import { SearchDialog } from "./SearchDialog";

type SearchContextValue = {
  openSearch: () => void;
};

const SearchContext = createContext<SearchContextValue | null>(null);

type SearchProviderProps = {
  items: SearchIndexItem[];
  children: React.ReactNode;
};

export function SearchProvider({ items, children }: SearchProviderProps) {
  const [open, setOpen] = useState(false);
  const safeItems = useMemo(() => items ?? [], [items]);

  const openSearch = useCallback(() => setOpen(true), []);
  const closeSearch = useCallback(() => setOpen(false), []);

  const contextValue = useMemo(() => ({ openSearch }), [openSearch]);

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

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
      <SearchDialog open={open} onClose={closeSearch} items={safeItems} />
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) {
    throw new Error("useSearch must be used within SearchProvider");
  }
  return ctx;
}
