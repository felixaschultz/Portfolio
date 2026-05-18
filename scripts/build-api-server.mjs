import * as esbuild from "esbuild";
import { mkdirSync } from "node:fs";

mkdirSync("api", { recursive: true });

await esbuild.build({
  entryPoints: ["server/vercel-entry.mjs"],
  outfile: "api/server.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  packages: "bundle",
  logLevel: "info",
});

console.log("[build-api-server] wrote api/server.mjs (single bundled function)");
