import { useLoaderData } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/$locale.contact";
import { ContactForm } from "../components/ContactForm";
import { defaultLocale, isValidLocale, type Locale } from "../lib/i18n";
import { buildPageMeta } from "../lib/seo";
import { seoCopy } from "../lib/seo-copy";
import { fetchContactHeroPhoto } from "../lib/sanity.server";

export async function loader() {
  return { heroPhoto: await fetchContactHeroPhoto() };
}

export function meta({ params }: Route.MetaArgs) {
  const locale = isValidLocale(params.locale ?? "") ? (params.locale as Locale) : defaultLocale;
  return buildPageMeta({
    title: seoCopy(locale, "contactTitle"),
    description: seoCopy(locale, "contactDescription"),
    locale,
    path: "/contact",
  });
}

export default function ContactPage() {
  const { t } = useTranslation();
  const { heroPhoto } = useLoaderData<typeof loader>();

  return (
    <div>
      {heroPhoto ? (
        <section className="home-hero" aria-labelledby="contact-hero-heading">
          <img
            src={heroPhoto.src}
            srcSet={heroPhoto.srcSet}
            sizes={heroPhoto.sizes}
            alt=""
            className="home-hero__bg"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          <div className="home-hero__shade" aria-hidden />
          <div className="home-hero__content">
            <h1 id="contact-hero-heading" className="home-hero__title font-display">
              {t("contact.title")}
            </h1>
            <p className="home-hero__lede">{t("contact.description")}</p>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-lg px-4 py-16 sm:px-6 sm:py-20">
        {!heroPhoto ? (
          <header className="mb-8">
            <h1 className="font-display text-3xl font-bold sm:text-4xl">{t("contact.title")}</h1>
            <p className="mt-2 text-[var(--color-muted)]">{t("contact.description")}</p>
          </header>
        ) : null}
        <ContactForm />
      </section>
    </div>
  );
}
