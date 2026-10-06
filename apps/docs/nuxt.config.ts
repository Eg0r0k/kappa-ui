import { readdirSync, readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import type { Nuxt } from 'nuxt/schema'

import { type PackageManifest, dependencyRanges as rangesOf } from '../../scripts/lib/dependency-ranges.ts'
import { contentFileToRoute } from './scripts/lib/routes.ts'

const siteUrl = (process.env.KAPPA_UI_URL ?? 'https://kappa-ui.pages.dev').replace(/\/+$/, '')

const readPackage = (path: string) =>
  JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8')) as PackageManifest & { version: string }

const corePackage = readPackage('../../packages/core/package.json')
const registryPackage = readPackage('../../packages/registry/package.json')
const registryVersion = registryPackage.version

// The Manual tab's ranges, from the helper the registry build stamps them with
const dependencyRanges = Object.fromEntries(rangesOf(corePackage, registryPackage))

const previewRoutes = (
  JSON.parse(readFileSync(new URL('../../packages/registry/registry.json', import.meta.url), 'utf8')) as {
    items: { name: string; categories?: string[] }[]
  }
).items
  .filter((item) => item.categories?.includes('example'))
  .map((item) => `/preview/${item.name}`)

const rawRoutes = (readdirSync(new URL('./content/docs', import.meta.url), { recursive: true }) as string[])
  .filter((file) => file.endsWith('.md'))
  .map((file) => `/raw${contentFileToRoute(file)}.md`)

// Nitro's replace plugin rewrites `typeof window` inside every server chunk, raw source strings included
const encodedRawSources = () => ({
  name: 'kappa:encoded-raw-sources',
  enforce: 'pre' as const,
  load: async (id: string) => {
    if (!id.endsWith('?raw')) return
    const content = await readFile(id.slice(0, -'?raw'.length), 'utf8')
    return `export default decodeURIComponent(${JSON.stringify(encodeURIComponent(content))})`
  },
})

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
      autoSubfolderIndex: false,
      crawlLinks: true,
      failOnError: true,
      routes: ['/', '/search.json', ...previewRoutes, ...rawRoutes],
    },
  },
  alias: {
    '@': fileURLToPath(new URL('../../packages/registry/src', import.meta.url)),
    '#registry': fileURLToPath(new URL('../../packages/registry', import.meta.url)),
  },
  css: ['~/assets/css/globals.css'],
  runtimeConfig: {
    public: { siteUrl, dependencyRanges, registryVersion },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
  vite: {
    plugins: [tailwindcss(), encodedRawSources()],
    resolve: { dedupe: ['vue'] },
  },
})
