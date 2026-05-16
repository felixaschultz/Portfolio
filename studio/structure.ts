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
      S.divider(),
      S.listItem()
        .title("Photos (legacy, one per document)")
        .schemaType("photo")
        .child(S.documentTypeList("photo").title("Photos")),
    ]);
