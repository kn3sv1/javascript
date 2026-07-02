import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "/dist/",
  build: {
    sourcemap: true,
    minify: false,
    outDir: "public/dist",

    rollupOptions: {
      output: {
        entryFileNames: "asserts/App.js",

        chunkFileNames: "asserts/[name].js",

        assetFileNames: "asserts/[name].[ext]",
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    include: ["tests/**/*.test.ts", "tests/**/*.spec.ts"]
  },
});
