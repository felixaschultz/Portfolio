import type { Route } from "./+types/$locale.imprint";
import { LegalPage } from "../components/LegalPage";
import { defaultLocale, isValidLocale, type Locale } from "../lib/i18n";
import { legalCopy } from "../lib/legal-copy";
import { buildPageMeta } from "../lib/seo";
import { seoCopy } from "../lib/seo-copy";

export function meta({ params }: Route.MetaArgs) {
  const locale = isValidLocale(params.locale ?? "") ? (params.locale as Locale) : defaultLocale;
  return buildPageMeta({
    title: seoCopy(locale, "imprintTitle"),
    description: seoCopy(locale, "imprintDescription"),
    locale,
    path: "/imprint",
  });
}

export default function ImprintPage({ params }: Route.ComponentProps) {
  const locale = isValidLocale(params.locale ?? "") ? (params.locale as Locale) : defaultLocale;
  const copy = legalCopy(locale, "imprint");

  return <LegalPage title={copy.title} updated={copy.updated} sections={copy.sections} />;
}
