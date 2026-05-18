import { Link, useLoaderData, useOutletContext, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/$locale._index";
import { HomeDoors } from "../components/HomeDoors";
import { Recommendations } from "../components/Recommendations";
import { getFeaturedProjects } from "../lib/projects.server";
import { fetchFeaturedGalleriesForList } from "../lib/sanity.server";
import type { GalleryListItem } from "../lib/galleries";
import { defaultLocale, isValidLocale, localizedField, type Locale } from "../lib/i18n";
import { buildPageMeta } from "../lib/seo";
import { seoCopy } from "../lib/seo-copy";

export async function loader() {
  const [featuredProjects, featuredGalleries] = await Promise.all([
    getFeaturedProjects(3),
    fetchFeaturedGalleriesForList(),
  ]);
  return {
    featuredProjects,
    featuredGalleries,
    featuredPhotos: featuredGalleries,
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
  const featuredProjects = data.featuredProjects ?? [];
  const featuredGalleries = data.featuredGalleries ?? data.featuredPhotos ?? [];
  const { locale } = useParams();
  const { t } = useTranslation();
  const { openContact } = useOutletContext<OutletContext>();
  const base = `/${locale}`;
  const lng = (locale ?? "da") as Locale;

  const photoCoverUrl = featuredGalleries[0]?.coverUrl;
  const devCoverUrl = featuredProjects[0]?.screenshot ?? undefined;

  return (
    <>
      <HomeDoors
        base={base}
        photoCoverUrl={photoCoverUrl}
        devCoverUrl={devCoverUrl}
        onContact={openContact}
      />

      {featuredGalleries.length > 0 ? (
        <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)] py-16 sm:py-20">
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
      <img
        src={gallery.coverUrl}
        alt={title}
        className="h-full w-full object-cover transition group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
        <p className="text-xs font-medium text-white">{title}</p>
      </div>
    </Link>
  );
}
