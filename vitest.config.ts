import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [viteReact()],
  define: {
    __VERCEL__: 'false',
  },
  test: {
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    restoreMocks: true,
    unstubGlobals: true,
  },
})
