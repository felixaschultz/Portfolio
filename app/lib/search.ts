export type SearchResultType = "project" | "gallery" | "page";

export type SearchIndexItem = {
  id: string;
  type: SearchResultType;
  title: string;
  excerpt: string;
  href: string;
  keywords: string;
};
