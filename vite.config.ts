/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import Path from 'path';
import { defineConfig, loadEnv } from 'vite';
import eslint from 'vite-plugin-eslint';
import topLevelAwait from 'vite-plugin-top-level-await';
import GithubActionsReporter from 'vitest-github-actions-reporter';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    // Vite strips out unknown ENV variables for security reasons.
    // We can provide prefixes of variables that should be included in the ENV.
    // See: https://vitejs.dev/guide/api-javascript.html#loadenv
    // See: https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
    'process.env': loadEnv(mode, process.cwd(), ['CX_', 'TAURI_', 'VITE_', 'APP_SIGNAL_']),
  },
  plugins: [
    topLevelAwait(),
    react(),
    eslint({
      failOnWarning: false,
      failOnError: false,
    }),
  ],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  // prevent vite from obscuring rust errors
  clearScreen: false,
  // tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
  },
  build: {
    // Tauri supports es2021
    target: process.env['TAURI_PLATFORM'] == 'windows' ? 'chrome105' : 'safari13',
    // don't minify for debug builds
    minify: !process.env['TAURI_DEBUG'] ? 'esbuild' : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env['TAURI_DEBUG'],
  },
  resolve: {
    alias: {
      api: Path.join(__dirname, 'src', 'api'),
      '@/': Path.join(__dirname, `src${Path.sep}`), // Trailing Path.sep is intentional!
      '@code-expert/prelude': Path.join(__dirname, 'packages', 'prelude'),
      '@code-expert/test-utils': Path.join(__dirname, 'packages', 'test-utils'),
      '@code-expert/type-utils': Path.join(__dirname, 'packages', 'type-utils'),
      '@code-expert/fp-ts-remote': Path.join(__dirname, 'packages', 'fp-ts-remote'),
    },
  },
  test: {
    /* for example, use global to avoid globals imports (describe, test, expect): */
    // globals: true,
    environment: 'jsdom',
    include: ['**/*.tests.{ts,tsx}'],
    reporters: process.env['GITHUB_ACTIONS'] ? ['default', new GithubActionsReporter()] : 'default',
  },
}));
