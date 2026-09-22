import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vitest/config'

const alias = {
  '~': fileURLToPath(new URL('./app', import.meta.url)),
  '@': fileURLToPath(new URL('../../packages/registry/src', import.meta.url)),
  '#registry': fileURLToPath(new URL('../../packages/registry', import.meta.url)),
}

export default defineConfig({
  test: {
    projects: [
      {
        resolve: { alias },
        test: { name: 'unit', environment: 'node', include: ['test/unit/**/*.test.ts'] },
      },
    ],
  },
})
