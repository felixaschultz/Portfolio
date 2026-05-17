import { defineArrayMember, defineField, defineType, type PreviewValue } from "sanity";
import { CoverImageInput } from "../components/CoverImageInput";
import { GalleryImagesInput } from "../components/GalleryImagesInput";

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
        "Use “Upload folder” to add images. After cloning a gallery, use “Clear all photos” first, then upload a new folder to replace them.",
      type: "array",
      of: [defineArrayMember({ type: "galleryImage" })],
      components: {
        input: GalleryImagesInput,
      },
      options: {
        layout: "grid",
      },
      validation: (rule) => rule.min(1).error("Add at least one image"),
    }),
    defineField({
      name: "coverImageKey",
      title: "Cover photo",
      type: "string",
      description: "Used on the photography index, home page, and social previews.",
      components: {
        input: CoverImageInput,
      },
    }),
    defineField({ name: "takenAt", title: "Date", type: "date" }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({
      name: "categories",
      title: "Categories",
      description:
        "Broad groupings (e.g. Travel, Nature). Create and publish categories under “Gallery categories”, then publish this gallery after assigning them — otherwise the site keeps the previous published version.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "galleryCategory" }] }],
    }),
    defineField({
      name: "tags",
      title: "Tags",
      description: "Topics or themes. Pick existing tags or create new ones under “Gallery tags”.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "galleryTag" }] }],
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
      coverImageKey: "coverImageKey",
      images: "images",
    },
    prepare({ title, location, coverImageKey, images }) {
      const list = (images ?? []) as { _key?: string; image?: unknown }[];
      const n = list.length;
      const cover =
        (coverImageKey
          ? list.find((item) => item._key === coverImageKey)?.image
          : undefined) ?? list[0]?.image;
      return {
        title: title || "Gallery",
        subtitle: [location, n ? `${n} photos` : "No photos"].filter(Boolean).join(" · "),
        media: cover,
      } as PreviewValue;
    },
  },
});
