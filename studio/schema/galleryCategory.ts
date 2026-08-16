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

export const galleryCategory = defineType({
  name: "galleryCategory",
  title: "Gallery category",
  type: "document",
  fields: [
    localizedString("title", "Title"),
    localizedString("description", "Description"),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: (doc) => {
          const title = doc.title as { en?: string; da?: string; de?: string } | undefined;
          return title?.en || title?.da || title?.de || "category";
        },
        maxLength: 64,
      },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "title.en", subtitle: "slug.current" },
    prepare({ title, subtitle }) {
      return {
        title: title || "Category",
        subtitle: subtitle ? `/${subtitle}` : undefined,
      };
    },
  },
});
