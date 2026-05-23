import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schema";
import { structure } from "./structure";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET ?? "production";

if (!projectId || projectId === "your_project_id") {
  throw new Error(
    "Missing SANITY_STUDIO_PROJECT_ID (or SANITY_PROJECT_ID in ../.env) — set it before building or running Studio.",
  );
}

export default defineConfig({
  name: "portfolio",
  title: "Felix Portfolio",
  projectId,
  dataset,
  // Vision (Monaco) breaks on mobile Safari; use local `npm run studio` if you need GROQ playground.
  plugins: [structureTool({ structure })],
  schema: { types: schemaTypes },
});
