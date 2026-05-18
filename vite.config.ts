import { reactRouter } from "@react-router/dev/vite";
import { vercelPreset } from "@vercel/react-router/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const isProdBuild = (command: string, mode: string) =>
  command === "build" && mode === "production";

export default defineConfig(({ command, mode }) => ({
  plugins: [tailwindcss(), reactRouter(), vercelPreset()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    // Safari (and others) cache native ESM modules aggressively; stale route
    // chunks caused SSR (fresh) vs client (cached) hydration mismatches after edits.
    headers: {
      "Cache-Control": "no-store",
    },
  },
  ssr: {
    external: ["sanitize-html"],
    // Vercel's server-index.mjs imports "react-router" at runtime. The package
    // resolves to dist/development/, which the deployment tracer often omits.
    // Bundle react-router into the server build so requests don't depend on that path.
    ...(isProdBuild(command, mode)
      ? { noExternal: ["react-router", "@react-router/node"] }
      : {}),
  },
}));
