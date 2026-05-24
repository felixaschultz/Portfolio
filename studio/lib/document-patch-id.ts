import type { SanityClient } from "sanity";

type DocumentPair = {
  draft?: { _id?: string; _type?: string } | null;
  displayed?: Record<string, unknown> | null;
  published?: Record<string, unknown> | null;
};

/** Published document id without the `drafts.` prefix. */
export function resolvePublishedDocumentId(document: DocumentPair): string | undefined {
  const raw =
    document.published?._id?.toString().trim() ||
    document.draft?._id?.toString().trim() ||
    document.displayed?._id?.toString().trim();
  if (!raw) return undefined;
  return raw.replace(/^drafts\./, "");
}

/** Id to patch in Studio (always the draft id when editing published content). */
export function resolveStudioPatchId(document: DocumentPair): string | undefined {
  const draftId = document.draft?._id?.trim();
  if (draftId) return draftId;

  const displayedId = document.displayed?._id?.toString().trim();
  if (displayedId?.startsWith("drafts.")) return displayedId;

  const publishedId = resolvePublishedDocumentId(document);
  if (!publishedId) return undefined;
  return `drafts.${publishedId}`;
}

function isDocumentNotFoundError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return message.includes("was not found") || message.includes("documentNotFoundError");
}

/** Create a draft from published/displayed when the Shop tab patches before Edit has. */
export async function ensureStudioDraft(
  client: SanityClient,
  document: DocumentPair,
): Promise<string> {
  const patchId = resolveStudioPatchId(document);
  if (!patchId) {
    throw new Error("No document id");
  }

  const existing = await client.getDocument(patchId);
  if (existing) return patchId;

  const source = (document.published ?? document.displayed) as
    | Record<string, unknown>
    | undefined;
  if (!source?._type) {
    throw new Error("No document to create draft from");
  }

  const { _rev: _publishedRev, ...publishedFields } = source;
  void _publishedRev;

  await client.createOrReplace({
    ...publishedFields,
    _id: patchId,
  });

  return patchId;
}

export async function commitStudioPatch(
  client: SanityClient,
  document: DocumentPair,
  apply: (patchId: string) => ReturnType<SanityClient["patch"]>,
): Promise<void> {
  let patchId = resolveStudioPatchId(document);
  if (!patchId) {
    throw new Error("No document id");
  }

  try {
    await apply(patchId).commit();
    return;
  } catch (err) {
    if (!isDocumentNotFoundError(err)) throw err;
  }

  patchId = await ensureStudioDraft(client, document);
  await apply(patchId).commit();
}
