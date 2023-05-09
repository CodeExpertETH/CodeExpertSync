/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import Path from 'path';
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import GithubActionsReporter from 'vitest-github-actions-reporter';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
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
  // to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    // Tauri supports es2021
    target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
  },
  resolve: {
    alias: {
      api: Path.resolve(__dirname, './src/api'),
      '@/*': Path.resolve(__dirname, './src/*'),
      '@code-expert/prelude': Path.resolve(__dirname, './packages/prelude'),
      '@code-expert/test-utils': Path.resolve(__dirname, './packages/test-utils'),
      '@code-expert/type-utils': Path.resolve(__dirname, './packages/type-utils'),
    },
  },
  test: {
    /* for example, use global to avoid globals imports (describe, test, expect): */
    // globals: true,
    environment: 'jsdom',
    include: ['**/*.tests.{ts,tsx}'],
    reporters: process.env.GITHUB_ACTIONS ? ['default', new GithubActionsReporter()] : 'default',
  },
  define: {
    'process.env': {},
  },
});
