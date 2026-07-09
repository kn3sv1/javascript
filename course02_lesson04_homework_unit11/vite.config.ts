import { defineConfig } from "vitest/config";

export default defineConfig({
  build: {
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
  },
});
