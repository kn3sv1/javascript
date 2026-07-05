import { defineConfig } from "vitest/config";

export default defineConfig({
  publicDir: "resources",
  build: {
    sourcemap: true,
    minify: false,
    outDir: "public",
    emptyOutDir: false,

    rollupOptions: {
      input: {
        index: "index.html",
      },
      output: {
        //entryFileNames: "assets/App.js",
        entryFileNames: (chunk) => {
          console.log(chunk.name);
          if (chunk.name === "index") return "assets/main.js";

          return "assets/[name].js";
        },

        chunkFileNames: "assets/[name].js",

        assetFileNames: "assets/[name].[ext]",
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
    include: ["tests/**/*.test.ts", "tests/**/*.spec.ts"],
  },
});
