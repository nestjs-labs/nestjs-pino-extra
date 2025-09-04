import { defineConfig } from 'vitest/config';
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.spec.ts', '**/*.test.ts'],
    exclude: ['**/*.d.ts', '**/*.spec.d.ts', '**/*.test.d.ts', '**/node_modules/**', '**/dist/**', '**/coverage/**'],
  },
  plugins: [tsconfigPaths()],
});
