import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import type { Nuxt } from 'nuxt/schema'

const siteUrl = (process.env.DELTA_UI_URL ?? 'https://delta-ui.dev').replace(/\/+$/, '')

const resolveMdcDepsThroughContent = (_options: unknown, nuxt: Nuxt) => {
  nuxt.hook('vite:extendConfig', (config) => {
    const include = config.optimizeDeps?.include
    if (!include) return
    config.optimizeDeps!.include = include.map((entry) =>
      entry.startsWith('@nuxtjs/mdc > ') ? `@nuxt/content > ${entry}` : entry,
    )
  })
}

export default defineNuxtConfig({
  compatibilityDate: '2026-09-22',
  devtools: { enabled: false },
  modules: ['@nuxt/content', '@nuxtjs/color-mode', 'nuxt-og-image', resolveMdcDepsThroughContent],
  site: {
    url: siteUrl,
    name: 'delta-ui',
  },
  ogImage: {
    zeroRuntime: true,
  },
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
      routes: ['/', '/search.json'],
    },
  },
  alias: {
    '@': fileURLToPath(new URL('../../packages/registry/src', import.meta.url)),
    '#registry': fileURLToPath(new URL('../../packages/registry', import.meta.url)),
  },
  css: ['~/assets/css/globals.css'],
  runtimeConfig: {
    public: { siteUrl },
  },
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
