import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  server: {
    port: Number(process.env.PORT) || 5173,
  },
  build: {
    outDir: "dist",
    target: "es2020",
  },
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts"],
  },
});
