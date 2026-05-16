import { useLoaderData } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/($locale).projects._index";
import { ProjectCard } from "../components/ProjectCard";
import { getProjects } from "../lib/projects.server";

export async function loader() {
  return { projects: getProjects() };
}

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `Projects | Felix A. Schultz` }];
}

export default function ProjectsIndex() {
  const { projects } = useLoaderData<typeof loader>();
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-bold">{t("projects.title")}</h1>
        <p className="mt-4 text-[var(--color-muted)]">{t("projects.description")}</p>
      </header>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
