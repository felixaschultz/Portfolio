import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Portfolio")
    .items([
      S.listItem()
        .title("Projects")
        .schemaType("project")
        .child(S.documentTypeList("project").title("Projects")),
      S.listItem()
        .title("Galleries")
        .schemaType("gallery")
        .child(S.documentTypeList("gallery").title("Galleries")),
      S.listItem()
        .title("Gallery bundles")
        .schemaType("galleryBundle")
        .child(S.documentTypeList("galleryBundle").title("Gallery bundles")),
      S.listItem()
        .title("Gallery categories")
        .schemaType("galleryCategory")
        .child(S.documentTypeList("galleryCategory").title("Gallery categories")),
      S.listItem()
        .title("Gallery tags")
        .schemaType("galleryTag")
        .child(S.documentTypeList("galleryTag").title("Gallery tags")),
      S.divider(),
      S.listItem()
        .title("Photos (legacy, one per document)")
        .schemaType("photo")
        .child(S.documentTypeList("photo").title("Photos")),
    ]);
