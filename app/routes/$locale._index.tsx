import { Link, useLoaderData, useOutletContext, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/$locale._index";
import { GalleryImage } from "../components/GalleryImage";
import { HomeDoors } from "../components/HomeDoors";
import { HomeFavoriteStack } from "../components/HomeFavoriteStack";
import { Recommendations } from "../components/Recommendations";
import { resolveHomeDevCover, resolveHomePhotoCover } from "../lib/home-page.server";
import { getFeaturedProjects } from "../lib/projects.server";
import { fetchFeaturedGalleriesForList, fetchHomeFavoritePhotos } from "../lib/sanity.server";
import type { GalleryListItem } from "../lib/galleries";
import { defaultLocale, isValidLocale, localizedField, type Locale } from "../lib/i18n";
import { buildPageMeta } from "../lib/seo";
import { seoCopy } from "../lib/seo-copy";

export async function loader() {
  const [featuredProjects, featuredGalleries, favoritePhotos] = await Promise.all([
    getFeaturedProjects(3),
    fetchFeaturedGalleriesForList(),
    fetchHomeFavoritePhotos(),
  ]);

  return {
    featuredProjects,
    featuredGalleries,
    favoritePhotos,
    photoCover: resolveHomePhotoCover(featuredGalleries),
    devCover: resolveHomeDevCover(featuredProjects[0]?.screenshot),
  };
}

export function meta({ params }: Route.MetaArgs) {
  const locale: Locale = isValidLocale(params.locale ?? "")
    ? (params.locale as Locale)
    : defaultLocale;
  return buildPageMeta({
    title: seoCopy(locale, "homeTitle"),
    description: seoCopy(locale, "homeDescription"),
    locale,
    path: "",
  });
}

type OutletContext = { openContact: () => void };

export default function HomePage() {
  const data = useLoaderData<typeof loader>();
  const featuredGalleries = data.featuredGalleries ?? [];
  const favoritePhotos = data.favoritePhotos ?? [];
  const { locale } = useParams();
  const { t } = useTranslation();
  const { openContact } = useOutletContext<OutletContext>();
  const base = `/${locale}`;
  const lng = (locale ?? "da") as Locale;

  const showFavorites = favoritePhotos.length > 0;

  return (
    <>
      <HomeDoors
        base={base}
        photoCover={data.photoCover}
        devCover={data.devCover}
        onContact={openContact}
      />

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
            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
              {featuredGalleries.slice(0, 4).map((gallery: GalleryListItem) => (
                <FeaturedGallery key={gallery._id} gallery={gallery} locale={lng} base={base} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">{t("about.title")}</h2>
        <p className="mt-6 max-w-3xl leading-relaxed text-[var(--color-muted)]">{t("about.body")}</p>
      </section>

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
