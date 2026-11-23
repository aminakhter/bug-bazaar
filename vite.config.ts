import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/bug-bazaar/' : '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        url: 'http://localhost:5173',
      },
    },
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    testTimeout: 30000,
  },
});