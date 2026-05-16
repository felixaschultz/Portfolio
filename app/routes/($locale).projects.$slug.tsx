import { Link, useLoaderData, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/($locale).projects.$slug";
import { HtmlContent } from "../components/HtmlContent";
import { getProjectBySlug } from "../lib/projects.server";
import { getLocalizedText } from "../lib/projects";
import type { Locale } from "../lib/i18n";

export async function loader({ params }: Route.LoaderArgs) {
  const project = getProjectBySlug(params.slug!);
  if (!project) {
    throw new Response("Not Found", { status: 404 });
  }
  return { project };
}

export function meta({ data }: Route.MetaArgs) {
  return [{ title: `${data?.project.name ?? "Project"} | Felix A. Schultz` }];
}

export default function ProjectDetail() {
  const { project } = useLoaderData<typeof loader>();
  const { locale } = useParams();
  const { t } = useTranslation();
  const lng = (locale ?? "da") as Locale;
  const base = `/${locale}`;
  const description = getLocalizedText(project.description, lng);
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
        <div className="mt-6 flex flex-wrap gap-3">
          {project.url && (
            <a href={project.url} target="_blank" rel="noreferrer" className="btn-primary">
              {t("projects.visitSite")}
            </a>
          )}
          {project.github && (
            <a href={project.github} target="_blank" rel="noreferrer" className="btn-ghost">
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
      {description && (
        <HtmlContent html={description} className="mt-12" />
      )}
    </article>
  );
}
