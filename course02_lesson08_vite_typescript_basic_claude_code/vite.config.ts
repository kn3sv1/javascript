import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // for debugger not to timeout we sewt 20 seconds delay
    testTimeout: 20000,
  },
});
