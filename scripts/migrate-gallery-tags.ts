/**
 * Migrates legacy string tags on gallery documents to galleryTag references.
 *
 * Usage:
 *   npm run migrate:gallery-tags          # apply
 *   npm run migrate:gallery-tags -- --dry-run
 *
 * Requires SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN (write) in .env
 */
import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import { createClient, type SanityClient } from "@sanity/client";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(rootDir, ".env") });

const dryRun = process.argv.includes("--dry-run");

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_TOKEN;

if (!projectId || projectId === "your_project_id") {
  console.error("Set SANITY_PROJECT_ID in .env");
  process.exit(1);
}
if (!token) {
  console.error("Set SANITY_API_TOKEN (Editor or Administrator, write access) in .env");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: process.env.SANITY_API_VERSION ?? "2024-05-16",
  token,
  useCdn: false,
});

/** URL slug and document-id suffix (ASCII only — Sanity IDs cannot contain å, ø, etc.). */
function tagSlug(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "tag";
}

function newKey(): string {
  return randomBytes(6).toString("hex");
}

type TagRef = { _type: "reference"; _ref: string; _key: string };

type GalleryRow = {
  _id: string;
  tags?: unknown[];
};

type GalleryTagRow = {
  _id: string;
  name: string;
  slug?: { current?: string };
};

function isStringTag(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isReferenceTag(value: unknown): value is { _ref: string; _key?: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "_ref" in value &&
    typeof (value as { _ref: unknown })._ref === "string"
  );
}

function refKey(ref: string, key?: string): TagRef {
  return {
    _type: "reference",
    _ref: ref,
    _key: key ?? newKey(),
  };
}

function refsFingerprint(refs: TagRef[]): string {
  return [...refs.map((r) => r._ref)].sort().join("|");
}

async function ensureGalleryTag(
  client: SanityClient,
  name: string,
  bySlug: Map<string, { _id: string; name: string }>,
): Promise<string> {
  const trimmed = name.trim();
  const slug = tagSlug(trimmed);
  if (!slug) throw new Error(`Invalid tag name: "${name}"`);

  const existing = bySlug.get(slug);
  if (existing) return existing._id;

  const docId = `galleryTag-${slug}`;
  const doc = {
    _id: docId,
    _type: "galleryTag" as const,
    name: trimmed,
    slug: { _type: "slug" as const, current: slug },
  };

  if (dryRun) {
    console.log(`  [dry-run] would create galleryTag: ${trimmed} (${docId})`);
  } else {
    await client.createOrReplace(doc);
    console.log(`  + galleryTag: ${trimmed}`);
  }

  bySlug.set(slug, { _id: docId, name: trimmed });
  return docId;
}

async function main() {
  console.log(
    `${dryRun ? "[dry-run] " : ""}Migrating gallery string tags → galleryTag documents (${projectId}/${dataset})…\n`,
  );

  const existingTags = await client.fetch<GalleryTagRow[]>(
    `*[_type == "galleryTag"]{ _id, name, slug }`,
  );
  const bySlug = new Map<string, { _id: string; name: string }>();
  for (const tag of existingTags) {
    const slug = tag.slug?.current ?? tagSlug(tag.name);
    if (slug) bySlug.set(slug, { _id: tag._id, name: tag.name });
  }
  console.log(`Found ${existingTags.length} existing galleryTag document(s).\n`);

  const galleries = await client.fetch<GalleryRow[]>(`*[_type == "gallery"]{ _id, tags }`);
  console.log(`Found ${galleries.length} gallery document(s).\n`);

  const stringTags = new Set<string>();
  for (const gallery of galleries) {
    for (const tag of gallery.tags ?? []) {
      if (isStringTag(tag)) stringTags.add(tag.trim());
    }
  }

  if (stringTags.size === 0) {
    console.log("No legacy string tags found on galleries. Nothing to migrate.");
    return;
  }

  console.log(`Unique string tags to migrate: ${stringTags.size}`);
  for (const name of [...stringTags].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }))) {
    await ensureGalleryTag(client, name, bySlug);
  }

  console.log("\nUpdating galleries…");
  let patched = 0;
  let skipped = 0;

  const tx = client.transaction();

  for (const gallery of galleries) {
    const raw = gallery.tags ?? [];
    const next: TagRef[] = [];
    const seenRefs = new Set<string>();

    for (const tag of raw) {
      if (isStringTag(tag)) {
        const slug = tagSlug(tag);
        const doc = bySlug.get(slug);
        if (!doc) continue;
        if (seenRefs.has(doc._id)) continue;
        seenRefs.add(doc._id);
        next.push(refKey(doc._id));
        continue;
      }

      if (isReferenceTag(tag)) {
        if (seenRefs.has(tag._ref)) continue;
        seenRefs.add(tag._ref);
        next.push(refKey(tag._ref, tag._key));
      }
    }

    const beforeRefs = raw
      .filter(isReferenceTag)
      .map((t) => t._ref)
      .sort()
      .join("|");
    const hadStrings = raw.some(isStringTag);
    const afterRefs = refsFingerprint(next);

    if (!hadStrings && beforeRefs === afterRefs) {
      skipped += 1;
      continue;
    }

    if (hadStrings || beforeRefs !== afterRefs) {
      console.log(`  ${gallery._id}: ${raw.length} tag(s) → ${next.length} reference(s)`);
      if (!dryRun) {
        tx.patch(gallery._id, { set: { tags: next } });
      }
      patched += 1;
    } else {
      skipped += 1;
    }
  }

  if (!dryRun && patched > 0) {
    await tx.commit();
  }

  console.log(
    `\n${dryRun ? "[dry-run] " : ""}Done. ${patched} gallery/galleries updated, ${skipped} unchanged.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
