import { Link, useLoaderData, useOutletContext, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/($locale)._index";
import { ProjectCard } from "../components/ProjectCard";
import { Recommendations } from "../components/Recommendations";
import { getFeaturedProjects } from "../lib/projects.server";
import { fetchFeaturedPhotosForList } from "../lib/sanity.server";
import type { PhotoListItem } from "../lib/photos";
import { localizedField, type Locale } from "../lib/i18n";

export async function loader() {
  const [featuredProjects, featuredPhotos] = await Promise.all([
    Promise.resolve(getFeaturedProjects(3)),
    fetchFeaturedPhotosForList(),
  ]);
  return { featuredProjects, featuredPhotos };
}

export function meta({ params }: Route.MetaArgs) {
  return [{ title: "Felix A. Schultz | Portfolio" }];
}

type OutletContext = { openContact: () => void };

export default function HomePage() {
  const { featuredProjects, featuredPhotos } = useLoaderData<typeof loader>();
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
          {featuredPhotos.length > 0 ? (
            <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
              {featuredPhotos.map((photo: PhotoListItem) => (
                <FeaturedPhoto key={photo._id} photo={photo} locale={lng} base={base} />
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

function FeaturedPhoto({
  photo,
  locale,
  base,
}: {
  photo: PhotoListItem;
  locale: Locale;
  base: string;
}) {
  const title = localizedField(photo.title, locale) || "Photo";
  return (
    <Link
      to={`${base}/photography/${photo.slug}`}
      className="group relative aspect-square overflow-hidden rounded-xl"
    >
      <img
        src={photo.imageUrl}
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
