import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { Project } from "../lib/projects";
import { getLocalizedText } from "../lib/projects";
import type { Locale } from "../lib/i18n";

type ProjectCardProps = {
  project: Project;
  featured?: boolean;
};

export function ProjectCard({ project, featured }: ProjectCardProps) {
  const { locale } = useParams();
  const { t } = useTranslation();
  const lng = (locale ?? "da") as Locale;
  const base = `/${locale}`;
  const image = project.screenshot ?? "/assets/responsive.svg";

  return (
    <Link
      to={`${base}/projects/${project.id}`}
      className={`group block overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] transition hover:border-[var(--color-accent)] hover:shadow-lg hover:shadow-[var(--color-accent)]/10 ${
        featured ? "md:col-span-1" : ""
      }`}
    >
      <div className="aspect-[16/10] overflow-hidden bg-[var(--color-bg)]">
        <img
          src={image}
          alt={project.name}
          className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold text-[var(--color-text)]">
          {project.name}
        </h3>
        <p className="mt-1 text-sm text-[var(--color-muted)]">{project.type}</p>
        <p className="mt-2 text-xs text-[var(--color-accent)]">
          {t("projects.tech")}: {project.technology}
        </p>
        {project.short_description && (
          <p className="mt-3 line-clamp-2 text-sm text-[var(--color-muted)]">
            {getLocalizedText(project.short_description, lng)}
          </p>
        )}
      </div>
    </Link>
  );
}
