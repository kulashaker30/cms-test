import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';
import tailwind from '@astrojs/tailwind';
import { fileURLToPath } from 'node:url';
import vercel from '@astrojs/vercel/serverless';
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [react(), tailwind()],
  vite: {
    resolve: {
      alias: {
        // point @ui to the *folder*; Vite will pick up its index.ts
        '@ui': fileURLToPath(new URL('../../packages/ui/src', import.meta.url)),
        '@shared': fileURLToPath(new URL('../../packages/shared/src', import.meta.url)),
      },
    },
  },
});
