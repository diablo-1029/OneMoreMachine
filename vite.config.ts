import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };

export default defineConfig({
  // Relative paths, so the build works from any folder: a domain root, a GitHub Pages sub-path, an itch.io frame.
  base: './',
  define: { __APP_VERSION__: JSON.stringify(version) },
  server: { port: 5183, strictPort: true },
  build: { target: 'es2022', chunkSizeWarningLimit: 900 },
});
