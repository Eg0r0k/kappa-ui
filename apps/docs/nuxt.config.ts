import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-09-22',
  devtools: { enabled: false },
  alias: {
    '@': fileURLToPath(new URL('../../packages/registry/src', import.meta.url)),
    '#registry': fileURLToPath(new URL('../../packages/registry', import.meta.url)),
  },
  css: ['~/assets/css/globals.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: { dedupe: ['vue'] },
  },
})
