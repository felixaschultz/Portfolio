import { defineArrayMember, defineField, defineType } from "sanity";
import { BundleDownloadLinkInput } from "../components/BundleDownloadLinkInput";

export const galleryBundle = defineType({
  name: "galleryBundle",
  title: "Gallery bundle",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Bundle name",
      type: "string",
      description: "Shown in Studio and used for the ZIP filename (e.g. “Smith wedding – full set”).",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "galleries",
      title: "Galleries",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "gallery" }],
        }),
      ],
      validation: (rule) =>
        rule
          .min(1)
          .error("Add at least one gallery")
          .max(3)
          .error("At most 3 galleries per bundle"),
    }),
    defineField({
      name: "downloadToken",
      title: "Bundle download link",
      type: "string",
      description:
        "One ZIP with a folder per gallery. Works before publish. For very large sets, customers may need to contact you for email delivery.",
      readOnly: true,
      components: {
        input: BundleDownloadLinkInput,
      },
    }),
  ],
  preview: {
    select: {
      title: "title",
      galleries: "galleries",
    },
    prepare({ title, galleries }) {
      const n = Array.isArray(galleries) ? galleries.length : 0;
      return {
        title: title || "Gallery bundle",
        subtitle: n ? `${n} gallery${n === 1 ? "" : "ies"}` : "No galleries",
      };
    },
  },
});
