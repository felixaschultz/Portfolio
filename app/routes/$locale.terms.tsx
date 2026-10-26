import type { Route } from "./+types/$locale.terms";
import { LegalPage } from "../components/LegalPage";
import { defaultLocale, isValidLocale, type Locale } from "../lib/i18n";
import { legalCopy } from "../lib/legal-copy";
import { buildPageMeta } from "../lib/seo";
import { seoCopy } from "../lib/seo-copy";

export function meta({ params }: Route.MetaArgs) {
  const locale = isValidLocale(params.locale ?? "") ? (params.locale as Locale) : defaultLocale;
  return buildPageMeta({
    title: seoCopy(locale, "termsTitle"),
    description: seoCopy(locale, "termsDescription"),
    locale,
    path: "/terms",
  });
}

export default function TermsPage({ params }: Route.ComponentProps) {
  const locale = isValidLocale(params.locale ?? "") ? (params.locale as Locale) : defaultLocale;
  const copy = legalCopy(locale, "terms");

  return <LegalPage title={copy.title} updated={copy.updated} intro={copy.intro} sections={copy.sections} />;
}
