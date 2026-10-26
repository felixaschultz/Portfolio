import { Link, useLoaderData, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/$locale.contact";
import { ContactForm } from "../components/ContactForm";
import { socialLinks } from "../components/SocialIcons";
import { categoryOptionsFromRefs, photographyCategoryPath } from "../lib/gallery-categories";
import { defaultLocale, isValidLocale, type Locale } from "../lib/i18n";
import { buildPageMeta } from "../lib/seo";
import { seoCopy } from "../lib/seo-copy";
import { fetchContactHeroPhoto, fetchPublishedGalleryCategories } from "../lib/sanity.server";
import { getDeliveryContactEmail } from "../lib/shop.server";

export async function loader() {
  const [heroPhoto, categories] = await Promise.all([
    fetchContactHeroPhoto(),
    fetchPublishedGalleryCategories(),
  ]);
  return { heroPhoto, categories, email: getDeliveryContactEmail() };
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
  const { heroPhoto, categories, email } = useLoaderData<typeof loader>();
  const { locale } = useParams();
  const lng = (locale ?? "da") as Locale;
  const specialties = categoryOptionsFromRefs(categories, lng);

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

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        {!heroPhoto ? (
          <header className="mb-8">
            <h1 className="font-display text-3xl font-bold sm:text-4xl">{t("contact.title")}</h1>
            <p className="mt-2 text-[var(--color-muted)]">{t("contact.description")}</p>
          </header>
        ) : null}

        <div className="contact-page__layout">
          <ContactForm />

          <aside className="contact-page__info">
            {email ? (
              <div className="contact-page__info-block">
                <h2 className="contact-page__info-title">{t("contact.directTitle")}</h2>
                <a href={`mailto:${email}`} className="contact-page__email-link">
                  {t("contact.emailCta")}
                </a>
              </div>
            ) : null}

            {specialties.length > 0 ? (
              <div className="contact-page__info-block">
                <h2 className="contact-page__info-title">{t("contact.specialtiesTitle")}</h2>
                <div className="gallery-overview__filter-chips">
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
              </div>
            ) : null}

            <div className="contact-page__info-block">
              <h2 className="contact-page__info-title">{t("contact.socialTitle")}</h2>
              <div className="site-footer__social">
                {socialLinks.map(({ name, href, Icon }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={name}
                    className="site-footer__social-link"
                  >
                    <Icon className="site-footer__social-icon" />
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
