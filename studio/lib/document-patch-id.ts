/** Draft document id used for Studio patches (published → drafts.{id}). */
export function resolveStudioPatchId(document: {
  draft?: { _id?: string } | null;
  displayed?: { _id?: string } | null;
  published?: { _id?: string } | null;
}): string | undefined {
  const draftId = document.draft?._id?.trim();
  if (draftId) return draftId;

  const base =
    document.displayed?._id?.trim() || document.published?._id?.trim();
  if (!base) return undefined;
  if (base.startsWith("drafts.")) return base;
  return `drafts.${base}`;
}
