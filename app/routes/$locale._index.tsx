import { Link, useLoaderData, useOutletContext, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/$locale._index";
import { ProjectCard } from "../components/ProjectCard";
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
    /** @deprecated Stale bundles may still read this — same data as featuredGalleries */
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
  const featuredGalleries =
    data.featuredGalleries ?? data.featuredPhotos ?? [];
  const { locale } = useParams();
  const { t } = useTranslation();
  const { openContact } = useOutletContext<OutletContext>();
  const base = `/${locale}`;
  const lng = (locale ?? "da") as Locale;

  return (
    <>
      <section className="relative overflow-hidden border-b border-[var(--color-border)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-accent-soft)_0%,_transparent_55%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div>
            <p className="font-mono text-sm text-[var(--color-accent)]">
              &lt;{t("hero.name")} /&gt;
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {t("hero.role")}
            </h1>
            <p className="mt-6 max-w-lg text-lg text-[var(--color-muted)]">{t("hero.intro")}</p>
            <button type="button" onClick={openContact} className="btn-primary mt-8">
              {t("hero.cta")}
            </button>
          </div>
          <div className="flex items-end justify-center lg:justify-end">
            <img
              src="/assets/me.jpg"
              alt="Felix Schultz"
              className="h-56 w-56 rounded-3xl border-4 border-[var(--color-border)] object-cover shadow-2xl lg:h-72 lg:w-72"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-semibold">{t("featured.projects")}</h2>
          <Link to={`${base}/projects`} className="text-sm text-[var(--color-accent)] hover:underline">
            {t("projects.showMore")} →
          </Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} featured />
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl font-semibold">{t("featured.photos")}</h2>
            <Link
              to={`${base}/photography`}
              className="text-sm text-[var(--color-accent)] hover:underline"
            >
              {t("photography.showMore")} →
            </Link>
          </div>
          {featuredGalleries.length > 0 ? (
            <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
              {featuredGalleries.map((gallery: GalleryListItem) => (
                <FeaturedGallery key={gallery._id} gallery={gallery} locale={lng} base={base} />
              ))}
            </div>
          ) : (
            <p className="mt-8 text-[var(--color-muted)]">{t("photography.empty")}</p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <h2 className="font-display text-3xl font-semibold">{t("about.title")}</h2>
            <p className="mt-6 leading-relaxed text-[var(--color-muted)]">{t("about.body")}</p>
          </div>
          <img
            src="/assets/me.jpg"
            alt=""
            className="hidden h-36 w-36 rounded-2xl object-cover lg:block"
          />
        </div>
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
