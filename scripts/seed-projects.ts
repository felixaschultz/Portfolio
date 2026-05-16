/**
 * One-time (or repeatable) import of content/projects.source.ts into Sanity.
 * Requires SANITY_PROJECT_ID, SANITY_DATASET, and SANITY_API_TOKEN (write) in .env
 */
import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@sanity/client";
import { projects } from "../content/projects.source";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(rootDir, ".env") });

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_TOKEN;

if (!projectId || projectId === "your_project_id") {
  console.error("Set SANITY_PROJECT_ID in .env");
  process.exit(1);
}
if (!token) {
  console.error("Set SANITY_API_TOKEN (write) in .env");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: process.env.SANITY_API_VERSION ?? "2024-05-16",
  token,
  useCdn: false,
});

function emptyToNull(value: string | null | undefined): string | null {
  if (value == null || value === "") return null;
  return value;
}

function localized(
  field: { da?: string; de?: string; en?: string } | undefined,
): { da: string; de: string; en: string } {
  return {
    da: field?.da?.trim() ?? "",
    de: field?.de?.trim() ?? "",
    en: field?.en?.trim() ?? "",
  };
}

async function main() {
  console.log(`Seeding ${projects.length} projects to ${projectId}/${dataset}…`);

  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    const doc = {
      _id: `project-${p.id}`,
      _type: "project" as const,
      name: p.name,
      slug: { _type: "slug" as const, current: p.id },
      screenshot: p.screenshot ?? "",
      highlight: Boolean(p.highlight),
      shortDescription: localized(p.short_description),
      description: localized(p.description),
      github: emptyToNull(p.github ?? undefined),
      url: emptyToNull(p.url ?? undefined),
      type: p.type ?? "",
      technology: p.technology ?? "",
      sortOrder: i,
    };

    await client.createOrReplace(doc);
    console.log(`  ✓ ${p.id}`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
