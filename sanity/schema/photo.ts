import { defineField, defineType } from "sanity";

const localizedString = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "object",
    fields: [
      { name: "da", title: "Danish", type: "string" },
      { name: "de", title: "German", type: "string" },
      { name: "en", title: "English", type: "string" },
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

export const photo = defineType({
  name: "photo",
  title: "Photo",
  type: "document",
  fields: [
    localizedString("title", "Title"),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title.en", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    localizedText("caption", "Caption"),
    defineField({ name: "takenAt", title: "Date taken", type: "date" }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({ name: "featured", title: "Featured on home", type: "boolean", initialValue: false }),
    defineField({ name: "sortOrder", title: "Sort order", type: "number" }),
  ],
  preview: {
    select: {
      title: "title.en",
      media: "image",
      subtitle: "location",
    },
  },
});
