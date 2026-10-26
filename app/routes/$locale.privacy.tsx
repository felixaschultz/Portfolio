import type { Route } from "./+types/$locale.privacy";
import { LegalPage } from "../components/LegalPage";
import { defaultLocale, isValidLocale, type Locale } from "../lib/i18n";
import { legalCopy } from "../lib/legal-copy";
import { buildPageMeta } from "../lib/seo";
import { seoCopy } from "../lib/seo-copy";

export function meta({ params }: Route.MetaArgs) {
  const locale = isValidLocale(params.locale ?? "") ? (params.locale as Locale) : defaultLocale;
  return buildPageMeta({
    title: seoCopy(locale, "privacyTitle"),
    description: seoCopy(locale, "privacyDescription"),
    locale,
    path: "/privacy",
  });
}

export default function PrivacyPage({ params }: Route.ComponentProps) {
  const locale = isValidLocale(params.locale ?? "") ? (params.locale as Locale) : defaultLocale;
  const copy = legalCopy(locale, "privacy");

  return (
    <LegalPage title={copy.title} updated={copy.updated} intro={copy.intro} sections={copy.sections}>
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">{copy.cookieTableHeading}</h2>
        <div className="mt-3" data-intastellar-cookies="" data-domain="felix-schultz.net" />
        <script src="https://www.intastellarconsents.com/cookie-table.js" defer />
      </section>
    </LegalPage>
  );
}
