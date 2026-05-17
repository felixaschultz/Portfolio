import { defineField, defineType } from "sanity";

export const galleryTag = defineType({
  name: "galleryTag",
  title: "Gallery tag",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: "Shown on the site and used when filtering galleries (e.g. “Drone”, “Night”).",
      validation: (rule) => rule.required().min(1).max(64),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 64 },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "name" },
  },
});
