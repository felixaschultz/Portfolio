export function siteBaseUrl(): string {
  const fromEnv = import.meta.env.SANITY_STUDIO_SITE_URL as string | undefined;
  return (fromEnv?.trim() || "https://www.felix-schultz.net").replace(/\/$/, "");
}
