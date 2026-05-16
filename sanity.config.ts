import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schema";

const projectId = process.env.SANITY_PROJECT_ID ?? "placeholder";
const dataset = process.env.SANITY_DATASET ?? "production";

export default defineConfig({
  name: "portfolio",
  title: "Felix Portfolio",
  projectId,
  dataset,
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
});
