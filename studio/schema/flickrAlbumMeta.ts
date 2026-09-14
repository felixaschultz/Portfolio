import { defineArrayMember, defineField, defineType } from "sanity";
import { FlickrAlbumIdInput } from "../components/FlickrAlbumIdInput";

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

export const flickrAlbumMeta = defineType({
  name: "flickrAlbumMeta",
  title: "Flickr album metadata",
  type: "document",
  fields: [
    defineField({
      name: "flickrAlbumId",
      title: "Flickr album ID",
      type: "string",
      readOnly: true,
      description: "Set automatically — do not edit manually.",
      components: { input: FlickrAlbumIdInput },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "albumTitle",
      title: "Album title (from Flickr)",
      type: "string",
      readOnly: true,
      hidden: true,
    }),
    localizedText("description", "Description"),
    defineField({
      name: "categories",
      title: "Categories",
      description: "Broad groupings shown on the photography index.",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "galleryCategory" }] })],
    }),
    defineField({
      name: "tags",
      title: "Tags",
      description: "Topics or themes used for filtering.",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "galleryTag" }] })],
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
    }),
    defineField({
      name: "featured",
      title: "Featured on home",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "albumTitle", albumId: "flickrAlbumId" },
    prepare({ title, albumId }) {
      return { title: title || albumId || "Flickr album" };
    },
  },
});
