import { defineArrayMember, defineField, defineType, type PreviewValue } from "sanity";
import { CoverImageInput } from "../components/CoverImageInput";
import { GalleryDownloadLinkInput } from "../components/GalleryDownloadLinkInput";
import { GalleryShopLinkInput } from "../components/GalleryShopLinkInput";
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
    defineField({
      name: "downloadToken",
      title: "Customer download link",
      type: "string",
      description:
        "Secret URL for full-size ZIP downloads. Works before publish; manage the link here only — never on the public site.",
      readOnly: true,
      components: {
        input: GalleryDownloadLinkInput,
      },
    }),
    defineField({
      name: "shopPricePersonalDkk",
      title: "Shop: personal price (DKK)",
      type: "number",
      description: "Override per-photo personal download price. Leave empty for default 149 DKK.",
      validation: (rule) => rule.min(1).max(100_000),
    }),
    defineField({
      name: "shopPriceCommercialDkk",
      title: "Shop: commercial price (DKK)",
      type: "number",
      description: "Override per-photo commercial license price. Leave empty for default 799 DKK.",
      validation: (rule) => rule.min(1).max(100_000),
    }),
    defineField({
      name: "shopPublicEnabled",
      title: "Show buy button on public gallery",
      type: "boolean",
      initialValue: false,
      description:
        "When enabled (and a shop link exists), visitors on the published photography album see “Buy & license photos”. The private shop link still works when this is off.",
    }),
    defineField({
      name: "shopToken",
      title: "Customer shop link",
      type: "string",
      description:
        "Stripe checkout for selected photos. Generate a link below. Works before publish; can also be shared directly when the public buy button is off.",
      readOnly: true,
      components: {
        input: GalleryShopLinkInput,
      },
    }),
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
