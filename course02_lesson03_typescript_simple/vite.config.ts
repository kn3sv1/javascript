import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "/dist/",
  build: {
    sourcemap: true,
    minify: false,
    outDir: "public/dist",

    rollupOptions: {
      input: {
        index: "index.html",
        about: "about.html",
      },
      output: {
        //entryFileNames: "assets/App.js",
        entryFileNames: (chunk) => {
          console.log(chunk.name);
          if (chunk.name === "index") return "assets/App.js";
          if (chunk.name === "about") return "assets/About.js";

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
