import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    headers: {
      "Cache-Control": "no-store",
    },
  },
  ssr: {
    external: ["sanitize-html"],
  },
});
