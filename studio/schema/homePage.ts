import { defineArrayMember, defineField, defineType } from "sanity";
import { HomeFavoritePhotosInput } from "../components/HomeFavoritePhotosInput";

export const homePage = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  fields: [
    defineField({
      name: "favoritePhotos",
      title: "Favorite photos (front page)",
      description:
        "Pick up to 5 images, reorder the stack (#1 = back), adjust fold per card, and crop each photo for the home page.",
      type: "array",
      of: [defineArrayMember({ type: "homeFavoritePhoto" })],
      validation: (rule) => rule.max(5).error("You can highlight at most 5 photos"),
      components: {
        input: HomeFavoritePhotosInput,
      },
    }),
    defineField({
      name: "spotlightSlides",
      title: "Spotlight slider",
      description:
        "Large manual slider on the home page (between favorites and gallery grid). Pick up to 8 photos; order is left-to-right in the slider.",
      type: "array",
      of: [defineArrayMember({ type: "homeFavoritePhoto" })],
      validation: (rule) => rule.max(8).error("You can add at most 8 spotlight slides"),
      components: {
        input: HomeFavoritePhotosInput,
      },
    }),
  ],
  preview: {
    prepare() {
      return { title: "Home page" };
    },
  },
});
