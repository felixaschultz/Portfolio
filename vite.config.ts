import { reactRouter } from "@react-router/dev/vite";
import { vercelPreset } from "@vercel/react-router/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  plugins: [tailwindcss(), reactRouter(), vercelPreset()],
  resolve: {
    tsconfigPaths: true,
    conditions:
      command === "build"
        ? ["production", "module", "import", "default"]
        : ["development", "module", "import", "default"],
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
    noExternal: ["react-router", "@react-router/node"],
  },
}));
