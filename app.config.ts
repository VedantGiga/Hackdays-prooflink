import { defineConfig } from "@tanstack/start/config";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: {
    plugins: [
      tailwindcss(),
      tsconfigPaths(),
    ],
    server: {
      headers: {
        "Cross-Origin-Opener-Policy": "unsafe-none",
      },
    },
  },
});
