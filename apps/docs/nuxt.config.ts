import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-09-22',
  devtools: { enabled: false },
  modules: ['@nuxt/content', '@nuxtjs/color-mode'],
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
    storageKey: 'delta-ui-color-mode',
  },
  content: {
    experimental: { sqliteConnector: 'native' },
    build: {
      markdown: {
        toc: { depth: 3, searchDepth: 3 },
        highlight: {
          theme: { default: 'github-light', dark: 'github-dark' },
          langs: ['vue', 'ts', 'bash', 'css', 'json'],
        },
      },
    },
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      failOnError: true,
      routes: ['/'],
    },
  },
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
