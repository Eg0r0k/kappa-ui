import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import type { Nuxt } from 'nuxt/schema'

const siteUrl = (process.env.KAPPA_UI_URL ?? 'https://kappa-ui.pages.dev').replace(/\/+$/, '')

const coreVersion = (
  JSON.parse(readFileSync(new URL('../../packages/core/package.json', import.meta.url), 'utf8')) as { version: string }
).version

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
    name: 'kappa-ui',
  },
  ogImage: {
    zeroRuntime: true,
    buildCache: true,
  },
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
    storageKey: 'kappa-ui-color-mode',
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
    public: { siteUrl, coreVersion },
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
