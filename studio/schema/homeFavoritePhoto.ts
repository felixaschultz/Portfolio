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
    defineField({
      name: "framing",
      title: "Card crop",
      description: "Adjust in Studio under Home page → favorite photos (drag preview + zoom).",
      type: "object",
      fields: [
        defineField({ name: "x", type: "number", hidden: true }),
        defineField({ name: "y", type: "number", hidden: true }),
        defineField({ name: "width", type: "number", hidden: true }),
        defineField({ name: "height", type: "number", hidden: true }),
      ],
    }),
    defineField({
      name: "stackPose",
      title: "Stack fold",
      description: "Tilt and offset for this card in the home page stack.",
      type: "object",
      fields: [
        defineField({ name: "rotate", type: "number", hidden: true }),
        defineField({ name: "offsetX", type: "number", hidden: true }),
        defineField({ name: "offsetY", type: "number", hidden: true }),
        defineField({ name: "scale", type: "number", hidden: true }),
      ],
    }),
  ],
});
