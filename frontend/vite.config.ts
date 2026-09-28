import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import netlify from "@netlify/vite-plugin-tanstack-start";

export default defineConfig(({ mode }) => {
  const isNetlify = mode === "netlify" || process.env.NETLIFY === "true" || process.env.VITE_PLATFORM === "netlify";
  const isVercel = mode === "vercel" || process.env.VERCEL === "1" || process.env.NITRO_PRESET === "vercel" || process.env.VITE_PLATFORM === "vercel";

  return {
    plugins: [
      tanstackStart({
        server: { entry: "server" },
      }),
      ...(isNetlify
        ? [netlify()]
        : [
            nitro({
              ...(isVercel ? { preset: "vercel" } : {}),
            }),
          ]),
      react(),
      tsconfigPaths(),
      tailwindcss(),
    ],
  };
});
