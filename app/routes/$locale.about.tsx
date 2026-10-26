import { Link, useLoaderData, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/$locale.about";
import { AboutDevBand } from "../components/AboutDevBand";
import { HomeSelectedWork } from "../components/HomeSelectedWork";
import { categoryOptionsFromRefs, photographyCategoryPath } from "../lib/gallery-categories";
import { defaultLocale, isValidLocale, type Locale } from "../lib/i18n";
import { buildPageMeta } from "../lib/seo";
import { seoCopy } from "../lib/seo-copy";
import { fetchHomeSelectedWork, fetchPublishedGalleryCategories } from "../lib/sanity.server";

const REPRESENTATIVE_PHOTO_COUNT = 6;

export async function loader() {
  const [categories, selectedWork] = await Promise.all([
    fetchPublishedGalleryCategories(),
    fetchHomeSelectedWork(),
  ]);
  return { categories, representativePhotos: selectedWork.slice(0, REPRESENTATIVE_PHOTO_COUNT) };
}

export function meta({ params }: Route.MetaArgs) {
  const locale = isValidLocale(params.locale ?? "") ? (params.locale as Locale) : defaultLocale;
  return buildPageMeta({
    title: seoCopy(locale, "aboutTitle"),
    description: seoCopy(locale, "aboutDescription"),
    locale,
    path: "/about",
  });
}

export default function AboutPage() {
  const { categories, representativePhotos } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const { locale } = useParams();
  const lng = (locale ?? "da") as Locale;
  const base = `/${lng}`;
  const specialties = categoryOptionsFromRefs(categories, lng);

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-16 pb-12 sm:px-6 sm:pt-20 sm:pb-16">
        <div className="about-page__intro">
          <img
            src="/assets/me.jpeg"
            alt={t("about.portraitAlt")}
            className="about-page__portrait"
            loading="eager"
          />
          <header className="about-page__copy">
            <h1 className="font-display text-3xl font-bold sm:text-4xl">{t("about.title")}</h1>
            <p className="mt-6 leading-relaxed text-[var(--color-muted)]">{t("about.body")}</p>
          </header>
        </div>
      </div>

      <AboutDevBand base={base} />

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
        {specialties.length > 0 ? (
          <section className="about-page__section about-page__section--first">
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">{t("about.specialtiesTitle")}</h2>
            <div className="mt-6 gallery-overview__filter-chips">
              {specialties.map((specialty) => (
                <Link
                  key={specialty.slug}
                  to={photographyCategoryPath(lng, specialty.slug)}
                  className="gallery-overview__filter-chip"
                >
                  {specialty.label}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {representativePhotos.length > 0 ? (
          <section className="about-page__section">
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">{t("about.workTitle")}</h2>
            <div className="mt-6">
              <HomeSelectedWork photos={representativePhotos} locale={lng} base={base} />
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
