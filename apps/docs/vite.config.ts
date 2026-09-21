import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    dedupe: ['vue'],
    alias: {
      // Deliberately points at the registry, not at the showcase's own src:
      // inside a component, `@/lib/utils` must resolve the same way here as
      // it will in a consumer's project once the CLI copies it there.
      '@': fileURLToPath(new URL('../../packages/registry/src', import.meta.url)),
      '~': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
