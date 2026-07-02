import { defineConfig } from "vite";

export default defineConfig({
  build: {
    sourcemap: true,
    minify: false,
    outDir: "public/dist",

    rollupOptions: {
      output: {
        entryFileNames:
          "asserts/App.js",

        chunkFileNames:
          "asserts/[name].js",

        assetFileNames:
          "asserts/[name].[ext]"
      }
    }
  }
});