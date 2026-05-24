import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { Outlet, redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/$locale";
import { RouteErrorBoundary } from "../components/RouteErrorBoundary";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { LocaleProvider } from "../components/LocaleProvider";
import { defaultLocale, isValidLocale, type Locale } from "../lib/i18n";

const ContactModal = lazy(() =>
  import("../components/ContactModal").then((m) => ({ default: m.ContactModal })),
);
const SearchDialog = lazy(() =>
  import("../components/SearchDialog").then((m) => ({ default: m.SearchDialog })),
);

export async function loader({ params }: Route.LoaderArgs) {
  const locale = (params as { locale?: string }).locale ?? defaultLocale;
  if (!isValidLocale(locale)) {
    throw redirect(`/${defaultLocale}`);
  }
  return { locale: locale as Locale };
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      context="site"
      className="error-page--in-layout"
    />
  );
}

export default function LocaleLayout() {
  const { locale } = useLoaderData<typeof loader>();
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
      <div className="site-layout">
        <SiteHeader onContactClick={openContact} onSearchClick={openSearch} />
        <div className="site-layout__body">
          <main className="site-layout__main">
            <Outlet context={{ openContact }} />
          </main>
          <SiteFooter />
        </div>
        {contactOpen ? (
          <Suspense fallback={null}>
            <ContactModal open onClose={closeContact} />
          </Suspense>
        ) : null}
        {searchOpen ? (
          <Suspense fallback={null}>
            <SearchDialog locale={locale} open onClose={closeSearch} />
          </Suspense>
        ) : null}
      </div>
    </LocaleProvider>
  );
}
