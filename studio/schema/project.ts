import { defineField, defineType } from "sanity";

const localizedHtml = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "object",
    fields: [
      { name: "da", title: "Danish", type: "text", rows: 12 },
      { name: "de", title: "German", type: "text", rows: 12 },
      { name: "en", title: "English", type: "text", rows: 12 },
    ],
  });

const localizedText = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "object",
    fields: [
      { name: "da", title: "Danish", type: "text", rows: 3 },
      { name: "de", title: "German", type: "text", rows: 3 },
      { name: "en", title: "English", type: "text", rows: 3 },
    ],
  });

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "screenshot",
      title: "Screenshot path",
      description: "Public URL path, e.g. /projects/my-app/screenshot.png",
      type: "string",
    }),
    defineField({
      name: "highlight",
      title: "Featured on home",
      type: "boolean",
      initialValue: false,
    }),
    localizedText("shortDescription", "Short description"),
    localizedHtml("description", "Description (HTML)"),
    defineField({ name: "github", title: "GitHub URL", type: "url" }),
    defineField({ name: "url", title: "Live URL", type: "url" }),
    defineField({ name: "type", title: "Type", type: "string" }),
    defineField({ name: "technology", title: "Technology", type: "string" }),
    defineField({ name: "sortOrder", title: "Sort order", type: "number" }),
  ],
  orderings: [
    {
      title: "Sort order",
      name: "sortOrderAsc",
      by: [
        { field: "sortOrder", direction: "asc" },
        { field: "name", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: { title: "name", subtitle: "type", highlight: "highlight" },
    prepare({ title, subtitle, highlight }) {
      return {
        title: title || "Project",
        subtitle: [highlight ? "Featured" : null, subtitle].filter(Boolean).join(" · "),
      };
    },
  },
});
