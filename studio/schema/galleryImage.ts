import { defineField, defineType } from "sanity";

export const galleryImage = defineType({
  name: "galleryImage",
  title: "Gallery image",
  type: "object",
  fields: [
    defineField({
      name: "image",
      title: "Image (Sanity asset)",
      type: "image",
      options: { hotspot: true },
      hidden: ({ parent }) => Boolean((parent as { externalUrl?: string })?.externalUrl),
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { externalUrl?: string } | undefined;
          if (value || parent?.externalUrl) return true;
          return "Upload an image via the gallery upload button";
        }),
    }),
    defineField({
      name: "externalUrl",
      title: "External image URL",
      type: "url",
      description: "Set automatically when uploading to your image server. Do not edit manually.",
      readOnly: true,
      hidden: ({ parent }) => !Boolean((parent as { externalUrl?: string })?.externalUrl),
    }),
    defineField({
      name: "externalWidth",
      title: "External image width",
      type: "number",
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: "externalHeight",
      title: "External image height",
      type: "number",
      readOnly: true,
      hidden: true,
    }),
    defineField({ name: "alt", title: "Alt text", type: "string" }),
    defineField({ name: "caption", title: "Caption", type: "string" }),
  ],
  preview: {
    select: { title: "caption", subtitle: "alt", media: "image", externalUrl: "externalUrl" },
    prepare({ title, subtitle, media, externalUrl }) {
      return {
        title: title || subtitle || "Image",
        subtitle: externalUrl ? "External image" : undefined,
        media: media ?? undefined,
      };
    },
  },
});
