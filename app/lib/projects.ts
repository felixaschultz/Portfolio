export type Locale = "da" | "de" | "en";

export type Project = {
  id: string;
  name: string;
  screenshot: string | null;
  highlight: boolean;
  description: Record<Locale, string>;
  short_description: Record<Locale, string>;
  github: string | null;
  url: string | null;
  type: string;
  technology: string;
  images?: Record<string, string>;
  /** Lower = more recent. Drives the chronological ordering of the projects list. */
  sortOrder: number;
  /** Only set when there's real evidence for the year (a dated screenshot, a date mentioned in the body). Omit rather than guess. */
  year?: string;
};

export function techList(technology: string): string[] {
  return technology
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function getLocalizedText(
  field: Record<Locale, string> | undefined,
  locale: Locale,
): string {
  if (!field) return "";
  return field[locale] || field.da || field.en || field.de || "";
}
