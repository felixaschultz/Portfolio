import { projects as projectsSource } from "../../content/projects.source";
import type { Project } from "./projects";
import { fetchProjectsFromSanity, isSanityConfigured } from "./sanity.server";

export type { Project, Locale } from "./projects";
export { getLocalizedText } from "./projects";

/** Static fallback when Sanity is empty or unavailable */
export const projects: Project[] = projectsSource as Project[];

let projectsCache: Project[] | null = null;

async function loadProjects(): Promise<Project[]> {
  if (projectsCache) return projectsCache;
  if (!isSanityConfigured()) return projects;
  const fromSanity = await fetchProjectsFromSanity();
  projectsCache = fromSanity.length > 0 ? fromSanity : projects;
  return projectsCache;
}

export async function getProjects(): Promise<Project[]> {
  return loadProjects();
}

export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  const list = await loadProjects();
  return list.filter((p) => p.highlight).slice(0, limit);
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  const list = await loadProjects();
  return list.find((p) => p.id === slug);
}
