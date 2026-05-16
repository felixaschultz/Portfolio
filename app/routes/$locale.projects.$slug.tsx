import { Link, useLoaderData, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/$locale.projects.$slug";
import { HtmlContent } from "../components/HtmlContent";
import { getProjectBySlug } from "../lib/projects.server";
import { getLocalizedText } from "../lib/projects";
import { defaultLocale, isValidLocale, type Locale } from "../lib/i18n";
import { sanitizePortfolioHtml } from "../lib/sanitize-html.server";
import { buildPageMeta, stripHtml } from "../lib/seo";
import { seoCopy } from "../lib/seo-copy";

export async function loader({ params }: Route.LoaderArgs) {
  const project = await getProjectBySlug(params.slug!);
  if (!project) {
    throw new Response("Not Found", { status: 404 });
  }

  const locale = isValidLocale(params.locale ?? "") ? (params.locale as Locale) : defaultLocale;
  const rawDescription = getLocalizedText(project.description, locale);
  const descriptionHtml = rawDescription ? sanitizePortfolioHtml(rawDescription) : "";

  return { project, descriptionHtml };
}

export function meta({ data, params }: Route.MetaArgs) {
  const locale = isValidLocale(params.locale ?? "") ? (params.locale as Locale) : defaultLocale;
  const project = data?.project;
  const short = project ? getLocalizedText(project.short_description, locale) : "";
  const description =
    short ||
    (project ? stripHtml(getLocalizedText(project.description, locale)) : "") ||
    seoCopy(locale, "projectsDescription");
  return buildPageMeta({
    title: project?.name ?? seoCopy(locale, "projectsTitle"),
    description,
    locale,
    path: project ? `/projects/${project.id}` : "/projects",
    image: project?.screenshot ?? undefined,
  });
}

export default function ProjectDetail() {
  const { project, descriptionHtml } = useLoaderData<typeof loader>();
  const { locale } = useParams();
  const { t } = useTranslation();
  const lng = (locale ?? "da") as Locale;
  const base = `/${locale}`;
  const shortDesc = getLocalizedText(project.short_description, lng);
  const image = project.screenshot ?? "/assets/responsive.svg";

  return (
    <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <Link to={`${base}/projects`} className="text-sm text-[var(--color-accent)] hover:underline">
        ← {t("projects.title")}
      </Link>
      <header className="mt-8">
        <h1 className="font-display text-4xl font-bold">{project.name}</h1>
        <p className="mt-2 text-[var(--color-muted)]">{project.type}</p>
        <p className="mt-1 text-sm text-[var(--color-accent)]">
          {t("projects.tech")}: {project.technology}
        </p>
        {shortDesc && <p className="mt-4 text-[var(--color-muted)]">{shortDesc}</p>}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {project.url && (
            <a href={project.url} target="_blank" rel="noreferrer" className="btn-primary w-full sm:w-auto">
              {t("projects.visitSite")}
            </a>
          )}
          {project.github && (
            <a href={project.github} target="_blank" rel="noreferrer" className="btn-ghost w-full sm:w-auto">
              {t("projects.visitGithub")}
            </a>
          )}
        </div>
      </header>
      <img
        src={image}
        alt={project.name}
        className="mt-10 w-full rounded-2xl border border-[var(--color-border)]"
      />
      {descriptionHtml ? <HtmlContent html={descriptionHtml} className="mt-12" /> : null}
    </article>
  );
}
