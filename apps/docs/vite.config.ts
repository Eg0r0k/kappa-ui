import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    dedupe: ['vue'],
    alias: {
      // Намеренно указывает на registry, а не на src витрины: внутри
      // компонента путь `@/lib/utils` должен резолвиться так же, как он
      // будет резолвиться в проекте потребителя после копирования.
      '@': fileURLToPath(new URL('../../packages/registry/src', import.meta.url)),
      '~': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
