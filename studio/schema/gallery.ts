import { defineArrayMember, defineField, defineType } from "sanity";

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

export const gallery = defineType({
  name: "gallery",
  title: "Gallery",
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
    localizedText("description", "Description"),
    defineField({
      name: "images",
      title: "Photos",
      description:
        "Drag multiple files onto this field or use “Upload” to add many images at once.",
      type: "array",
      of: [defineArrayMember({ type: "galleryImage" })],
      options: {
        layout: "grid",
      },
      validation: (rule) => rule.min(1).error("Add at least one image"),
    }),
    defineField({ name: "takenAt", title: "Date", type: "date" }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "featured",
      title: "Featured on home",
      type: "boolean",
      initialValue: false,
    }),
    defineField({ name: "sortOrder", title: "Sort order", type: "number" }),
  ],
  preview: {
    select: {
      title: "title.en",
      location: "location",
      media: "images.0.image",
      count: "images",
    },
    prepare({ title, location, media, count }) {
      const n = Array.isArray(count) ? count.length : 0;
      return {
        title: title || "Gallery",
        subtitle: [location, n ? `${n} photos` : "No photos"].filter(Boolean).join(" · "),
        media,
      };
    },
  },
});
