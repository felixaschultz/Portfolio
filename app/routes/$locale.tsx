import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { Outlet, redirect, useLoaderData, useNavigation } from "react-router";
import type { Route } from "./+types/$locale";
import { RouteErrorBoundary } from "../components/RouteErrorBoundary";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { LocaleProvider } from "../components/LocaleProvider";
import { defaultLocale, isValidLocale, type Locale } from "../lib/i18n";
import {
  crossDomainUrl,
  localeAllowedOnHost,
  resolveEntryLocale,
  shouldEnforceDomainLocale,
} from "../lib/site-domains";

const SearchDialog = lazy(() =>
  import("../components/SearchDialog").then((m) => ({ default: m.SearchDialog })),
);

export async function loader({ params, request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const localeParam = (params as { locale?: string }).locale ?? defaultLocale;

  if (!isValidLocale(localeParam)) {
    throw redirect(`/${resolveEntryLocale(url.hostname)}`);
  }

  const locale = localeParam as Locale;

  if (shouldEnforceDomainLocale(url.hostname) && !localeAllowedOnHost(locale, url.hostname)) {
    throw redirect(crossDomainUrl(locale, url.pathname, url.search));
  }

  return { locale };
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

function NavProgressBar() {
  const navigation = useNavigation();
  const [phase, setPhase] = useState<"idle" | "loading" | "complete">("idle");

  useEffect(() => {
    if (navigation.state !== "idle") {
      setPhase("loading");
    } else if (phase === "loading") {
      setPhase("complete");
      const timer = setTimeout(() => setPhase("idle"), 500);
      return () => clearTimeout(timer);
    }
  }, [navigation.state, phase]);

  if (phase === "idle") return null;
  return (
    <div
      aria-hidden
      className={`nav-progress-bar${phase === "complete" ? " nav-progress-bar--complete" : ""}`}
    />
  );
}

export default function LocaleLayout() {
  const { locale } = useLoaderData<typeof loader>();
  const [searchOpen, setSearchOpen] = useState(false);

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
      <NavProgressBar />
      <div className="site-layout">
        <SiteHeader onSearchClick={openSearch} />
        <div className="site-layout__body">
          <main className="site-layout__main">
            <Outlet />
          </main>
          <SiteFooter />
        </div>
        {searchOpen ? (
          <Suspense fallback={null}>
            <SearchDialog locale={locale} open onClose={closeSearch} />
          </Suspense>
        ) : null}
      </div>
    </LocaleProvider>
  );
}
