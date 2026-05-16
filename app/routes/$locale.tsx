import { useCallback, useEffect, useState } from "react";
import { Outlet, redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/$locale";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { ContactModal } from "../components/ContactModal";
import { SearchDialog } from "../components/SearchDialog";
import { LocaleProvider } from "../components/LocaleProvider";
import { defaultLocale, isValidLocale, type Locale } from "../lib/i18n";
import { buildSearchIndex } from "../lib/search.server";

export async function loader({ params }: Route.LoaderArgs) {
  const locale = (params as { locale?: string }).locale ?? defaultLocale;
  if (!isValidLocale(locale)) {
    throw redirect(`/${defaultLocale}`);
  }
  const lng = locale as Locale;
  try {
    const searchIndex = await buildSearchIndex(lng);
    return { locale: lng, searchIndex };
  } catch (error) {
    console.error("search index failed", error);
    return { locale: lng, searchIndex: [] };
  }
}

export default function LocaleLayout() {
  const { locale, searchIndex } = useLoaderData<typeof loader>();
  const [contactOpen, setContactOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const openContact = useCallback(() => setContactOpen(true), []);
  const closeContact = useCallback(() => setContactOpen(false), []);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <LocaleProvider locale={locale}>
      <div className="flex min-h-screen flex-col">
        <SiteHeader onContactClick={openContact} onSearchClick={openSearch} />
        <main className="flex-1">
          <Outlet context={{ openContact }} />
        </main>
        <SiteFooter />
        <ContactModal open={contactOpen} onClose={closeContact} />
        <SearchDialog open={searchOpen} onClose={closeSearch} items={searchIndex ?? []} />
      </div>
    </LocaleProvider>
  );
}
