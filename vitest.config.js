import { defineConfig } from 'vitest/config';

console.log('vitest.config.js');
export default defineConfig({
  test: {
    setupFiles: ['./testSetup.js'],
  },
});
