import { defineField, defineType } from "sanity";

export const galleryImage = defineType({
  name: "galleryImage",
  title: "Gallery image",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "alt", title: "Alt text", type: "string" }),
    defineField({ name: "caption", title: "Caption", type: "string" }),
  ],
  preview: {
    select: { title: "caption", subtitle: "alt", media: "image" },
    prepare({ title, subtitle, media }) {
      return {
        title: title || subtitle || "Image",
        media,
      };
    },
  },
});
