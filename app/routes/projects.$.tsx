import type { Route } from "./+types/projects.$";

/**
 * Catch mistaken navigations to /projects/... (e.g. broken img src URLs).
 * Static files live under /public/projects and are served by the host for valid paths.
 */
export function loader() {
  throw new Response("Not Found", { status: 404 });
}
