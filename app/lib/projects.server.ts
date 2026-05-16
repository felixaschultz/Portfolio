import { projects as projectsSource } from "../../content/projects.source";
import type { Project } from "./projects";

export type { Project, Locale } from "./projects";
export { getLocalizedText } from "./projects";

export const projects: Project[] = projectsSource as Project[];

export function getProjects(): Project[] {
  return projects;
}

export function getFeaturedProjects(limit = 3): Project[] {
  return projects.filter((p) => p.highlight).slice(0, limit);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.id === slug);
}
