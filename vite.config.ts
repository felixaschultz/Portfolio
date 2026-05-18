import { reactRouter } from "@react-router/dev/vite";
import { vercelPreset } from "@vercel/react-router/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
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
    // Keep react-router in the server bundle. Vercel's serverless tracer often drops
    // node_modules/react-router/dist/development, but Node still resolves the package
    // to that path at runtime → ERR_MODULE_NOT_FOUND on deploy.
    external: ["sanitize-html"],
    noExternal: ["react-router", "@react-router/node"],
  },
});
