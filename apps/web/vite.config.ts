import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');

function workspaceSourceAliases(): Record<string, string> {
  const containers = [join(repoRoot, 'packages'), join(repoRoot, 'packages', 'exercises')];
  const aliases: Record<string, string> = {};

  for (const container of containers) {
    if (!existsSync(container)) {
      continue;
    }
    for (const entry of readdirSync(container, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }
      const packageJsonPath = join(container, entry.name, 'package.json');
      if (!existsSync(packageJsonPath)) {
        continue;
      }
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
        name?: string;
        main?: string;
      };
      if (packageJson.name && packageJson.main) {
        aliases[packageJson.name] = join(container, entry.name, packageJson.main);
      }
    }
  }

  return aliases;
}

export default defineConfig({
  base: process.env['GITHUB_PAGES'] === 'true' ? '/DB_Dojo/' : '/',
  resolve: {
    alias: workspaceSourceAliases(),
    dedupe: ['react', 'react-dom']
  },
  optimizeDeps: {
    exclude: ['@electric-sql/pglite']
  },
  server: {
    fs: { allow: [repoRoot] }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // PGlite's WASM runtime is ~10 MB; it must be precached (not just the default 2 MB
        // cap) since offline Postgres access is the app's core feature.
        maximumFileSizeToCacheInBytes: 16 * 1024 * 1024
      },
      manifest: {
        name: 'DB Dojo',
        short_name: 'DB Dojo',
        description: 'Practice PostgreSQL: SQL, permissions, indexes and PL/pgSQL.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '.',
        scope: '.',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }]
      }
    })
  ]
});
