import { Link, useLoaderData, useOutletContext, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/$locale._index";
import { GalleryImage } from "../components/GalleryImage";
import { HomeDevBand } from "../components/HomeDevBand";
import { HomeFavoriteStack } from "../components/HomeFavoriteStack";
import { HomeHero } from "../components/HomeHero";
import { HomeSelectedWork } from "../components/HomeSelectedWork";
import { HomeSpotlightSlider } from "../components/HomeSpotlightSlider";
import { Recommendations } from "../components/Recommendations";
import { categoryOptionsFromRefs, photographyCategoryPath } from "../lib/gallery-categories";
import { resolveHomePhotoCover } from "../lib/home-page.server";
import {
  fetchFeaturedGalleriesForList,
  fetchHomeFavoritePhotos,
  fetchHomeSelectedWork,
  fetchHomeSpotlightSlides,
  fetchPublishedGalleryCategories,
} from "../lib/sanity.server";
import type { GalleryListItem } from "../lib/galleries";
import { createI18n, defaultLocale, isValidLocale, localizedField, type Locale } from "../lib/i18n";
import { buildOgImageUrl, buildPageMeta, OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from "../lib/seo";
import { seoCopy } from "../lib/seo-copy";

export async function loader() {
  const [featuredGalleries, favoritePhotos, spotlightSlides, selectedWork, categories] = await Promise.all([
    fetchFeaturedGalleriesForList(),
    fetchHomeFavoritePhotos(),
    fetchHomeSpotlightSlides(),
    fetchHomeSelectedWork(),
    fetchPublishedGalleryCategories(),
  ]);

  return {
    featuredGalleries,
    favoritePhotos,
    spotlightSlides,
    selectedWork,
    categories,
    photoCover: resolveHomePhotoCover(featuredGalleries),
  };
}

export function meta({ params, data }: Route.MetaArgs) {
  const locale: Locale = isValidLocale(params.locale ?? "")
    ? (params.locale as Locale)
    : defaultLocale;
  const i18n = createI18n(locale);

  const ogImage = buildOgImageUrl({
    title: i18n.t("home.hero.heading"),
    subtitle: i18n.t("home.hero.lede"),
    eyebrow: i18n.t("hero.name"),
    image: data?.photoCover?.src,
  });

  return buildPageMeta({
    title: seoCopy(locale, "homeTitle"),
    description: seoCopy(locale, "homeDescription"),
    locale,
    path: "",
    image: ogImage,
    ogImageWidth: OG_IMAGE_WIDTH,
    ogImageHeight: OG_IMAGE_HEIGHT,
  });
}

type OutletContext = { openContact: () => void };

export default function HomePage() {
  const data = useLoaderData<typeof loader>();
  const featuredGalleries = data.featuredGalleries ?? [];
  const favoritePhotos = data.favoritePhotos ?? [];
  const spotlightSlides = data.spotlightSlides ?? [];
  const selectedWork = data.selectedWork ?? [];
  const categories = data.categories ?? [];
  const { locale } = useParams();
  const { t } = useTranslation();
  const { openContact } = useOutletContext<OutletContext>();
  const base = `/${locale}`;
  const lng = (locale ?? "da") as Locale;

  const showFavorites = favoritePhotos.length > 0;
  const showSpotlight = spotlightSlides.length > 0;
  const categoryOptions = categoryOptionsFromRefs(categories, lng);

  return (
    <>
      <HomeHero base={base} photoCover={data.photoCover} />
      {showFavorites ? (
        <section className="home-favorites-section border-b border-[var(--color-border)] bg-[var(--color-surface)] py-16 sm:py-24">
          <div className="home-favorites-section__inner mx-auto max-w-6xl px-4 sm:px-6">
            <header className="home-favorites-section__header">
              <h2 className="font-display text-2xl font-semibold sm:text-3xl">
                {t("home.favorites.title")}
              </h2>
              <p className="mt-2 max-w-xl text-sm text-[var(--color-muted)] sm:text-base">
                {t("home.favorites.lede")}
              </p>
            </header>
            <div className="home-favorites-section__layout">
              <HomeFavoriteStack photos={favoritePhotos} locale={lng} base={base} />
            </div>
          </div>
        </section>
      ) : null}

      {showSpotlight ? (
        <section className="home-spotlight-section" aria-label={t("home.spotlight.carousel")}>
          <HomeSpotlightSlider slides={spotlightSlides} locale={lng} base={base} />
        </section>
      ) : null}

      {selectedWork.length > 0 ? (
        <section
          className="border-b border-[var(--color-border)] bg-[var(--color-surface)] py-16 sm:py-24"
          aria-label={t("home.selectedWork.title")}
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <HomeSelectedWork photos={selectedWork} locale={lng} base={base} />
          </div>
        </section>
      ) : null}

      {featuredGalleries.length > 0 ? (
        <section className="border-b border-[var(--color-border)] bg-[var(--color-bg)] py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
              <h2 className="font-display text-2xl font-semibold sm:text-3xl">
                {t("home.photoPreview.title")}
              </h2>
              <Link
                to={`${base}/photography`}
                className="text-sm text-[var(--color-accent)] hover:underline"
              >
                {t("photography.showMore")} →
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {featuredGalleries.map((gallery: GalleryListItem) => (
                <FeaturedGallery key={gallery._id} gallery={gallery} locale={lng} base={base} />
              ))}
            </div>
            {categoryOptions.length > 0 ? (
              <nav className="home-categories" aria-label={t("home.categories.title")}>
                <p className="home-categories__title">{t("home.categories.title")}</p>
                <div className="gallery-overview__filter-chips">
                  {categoryOptions.map((category) => (
                    <Link
                      key={category.slug}
                      to={photographyCategoryPath(lng, category.slug)}
                      className="gallery-overview__filter-chip"
                    >
                      {category.label}
                    </Link>
                  ))}
                </div>
              </nav>
            ) : null}
          </div>
        </section>
      ) : null}

      <HomeDevBand base={base} onContact={openContact} />

      <Recommendations />
    </>
  );
}

function FeaturedGallery({
  gallery,
  locale,
  base,
}: {
  gallery: GalleryListItem;
  locale: Locale;
  base: string;
}) {
  const title = localizedField(gallery.title, locale) || "Gallery";
  return (
    <Link
      to={`${base}/photography/${gallery.slug}`}
      className="group relative aspect-square overflow-hidden rounded-xl"
    >
      <GalleryImage
        src={gallery.coverUrl}
        srcSet={gallery.coverSrcSet}
        sizes="(max-width: 767px) 50vw, (max-width: 1279px) 25vw, 18rem"
        blurSrc={gallery.coverBlurUrl}
        alt={title}
        className="h-full w-full object-cover transition group-hover:scale-105"
        loading="lazy"
      />
      <div className="home-featured-gallery__caption absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <p className="text-xs font-medium text-white">{title}</p>
      </div>
    </Link>
  );
}
