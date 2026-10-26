import { Link, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import type { Project } from "../lib/projects";
import { getLocalizedText, techList } from "../lib/projects";
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
  const tech = techList(project.technology);

  return (
    <Link
      to={`${base}/projects/${project.id}`}
      className="group block overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] transition hover:border-[var(--color-accent)] hover:shadow-lg hover:shadow-[var(--color-accent)]/10"
    >
      <div className={`${featured ? "aspect-[16/8]" : "aspect-[16/10]"} overflow-hidden bg-[var(--color-bg)]`}>
        <img
          src={image}
          alt={project.name}
          className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>
      <div className={featured ? "p-6" : "p-5"}>
        <div className="flex items-baseline justify-between gap-3">
          <h3 className={`font-display font-semibold text-[var(--color-text)] ${featured ? "text-xl" : "text-lg"}`}>
            {project.name}
          </h3>
          {project.year && (
            <span className="shrink-0 font-mono text-xs text-[var(--color-muted)]">{project.year}</span>
          )}
        </div>
        <p className="mt-1 text-sm text-[var(--color-muted)]">{project.type}</p>
        {tech.length > 0 && (
          <ul className="tech-chips tech-chips--tight mt-3">
            {tech.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
        {project.short_description && (
          <p className={`mt-3 text-sm text-[var(--color-muted)] ${featured ? "line-clamp-3" : "line-clamp-2"}`}>
            {getLocalizedText(project.short_description, lng)}
          </p>
        )}
      </div>
    </Link>
  );
}
