import { useState } from "react";
import { Outlet, redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/$locale";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { ContactModal } from "../components/ContactModal";
import { LocaleProvider } from "../components/LocaleProvider";
import { defaultLocale, isValidLocale, type Locale } from "../lib/i18n";

export async function loader({ params }: Route.LoaderArgs) {
  const locale = (params as { locale?: string }).locale ?? defaultLocale;
  if (!isValidLocale(locale)) {
    throw redirect(`/${defaultLocale}`);
  }
  return { locale: locale as Locale };
}

export default function LocaleLayout() {
  const { locale } = useLoaderData<typeof loader>();
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <LocaleProvider locale={locale}>
      <div className="flex min-h-screen flex-col">
        <SiteHeader onContactClick={() => setContactOpen(true)} />
        <main className="flex-1">
          <Outlet context={{ openContact: () => setContactOpen(true) }} />
        </main>
        <SiteFooter />
        <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
      </div>
    </LocaleProvider>
  );
}
