import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    tsconfigPaths: true,
  },
  define: {
    // Vercel sets `VERCEL=1` during its builds. Only used to decide whether to load Vercel's
    // analytics scripts; the app itself is identical on every target.
    __VERCEL__: JSON.stringify(process.env.VERCEL === '1'),
  },
  plugins: [
    tanstackStart({
      importProtection: {
        behavior: 'error',
      },
    }),
    // The deployment target is chosen by Nitro's preset, not by the app. Locally this
    // builds a Node server (`pnpm start`); on Vercel the `vercel` preset is detected
    // automatically (or forced with `NITRO_PRESET=vercel`).
    nitro({
      // pdfkit (used by react-pdf) lazily `require`s its standard fonts through package.json
      // subpath imports, which can't survive bundling. Ship the whole package as a traced
      // dependency instead.
      traceDeps: ['pdfkit*'],
    }),
    // React's plugin must come after Start's plugin.
    viteReact(),
    tailwindcss(),
  ],
})
