import { defineField, defineType } from "sanity";

export const homeFavoritePhoto = defineType({
  name: "homeFavoritePhoto",
  title: "Favorite photo",
  type: "object",
  fields: [
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "reference",
      to: [{ type: "gallery" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "imageKey",
      title: "Image key",
      type: "string",
      validation: (rule) => rule.required(),
    }),
  ],
});
