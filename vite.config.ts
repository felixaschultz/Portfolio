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
    headers: {
      "Cache-Control": "no-store",
    },
  },
  ssr: {
    // Bundle react-router for Vercel — otherwise runtime resolves missing dist files.
    external: ["sanitize-html"],
    noExternal: ["react-router", "@react-router/node"],
  },
});
