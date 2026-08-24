import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
    restoreMocks: true,
	// for debugger not to timeout we sewt 20 seconds delay
    testTimeout: 20000,
  },
});
