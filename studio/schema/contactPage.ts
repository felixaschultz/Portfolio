import { defineArrayMember, defineField, defineType } from "sanity";
import { HomeFavoritePhotosInput } from "../components/HomeFavoritePhotosInput";

export const contactPage = defineType({
  name: "contactPage",
  title: "Contact page",
  type: "document",
  fields: [
    defineField({
      name: "heroImage",
      title: "Hero photo",
      description:
        "The full-bleed photo behind the contact page heading. Pick one gallery or Flickr photo and crop it.",
      type: "array",
      of: [defineArrayMember({ type: "homeFavoritePhoto" })],
      validation: (rule) => rule.max(1).error("Pick a single hero photo"),
      components: {
        input: HomeFavoritePhotosInput,
      },
    }),
  ],
  preview: {
    prepare() {
      return { title: "Contact page" };
    },
  },
});
