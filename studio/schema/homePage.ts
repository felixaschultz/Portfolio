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
        "Pick up to 5 single images from any gallery. They appear in the stacked “favorite shots” section on the home page.",
      type: "array",
      of: [defineArrayMember({ type: "homeFavoritePhoto" })],
      validation: (rule) => rule.max(5).error("You can highlight at most 5 photos"),
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
