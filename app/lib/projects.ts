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
};

export function getLocalizedText(
  field: Record<Locale, string> | undefined,
  locale: Locale,
): string {
  if (!field) return "";
  return field[locale] || field.da || field.en || field.de || "";
}
