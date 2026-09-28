import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { contentFileToRoute } from './lib/routes.ts'

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const contentDir = join(docsRoot, 'content/docs')
const registryDir = join(docsRoot, 'public/r')
const outDir = join(docsRoot, '.output/public')

const missing: string[] = []
const ogImage = /<meta[^>]+property="og:image"[^>]+content="([^"]+)"/

const pages = (await readdir(contentDir, { recursive: true })).filter((file) => file.endsWith('.md'))
for (const file of pages) {
  const route = contentFileToRoute(file)
  const html = join(outDir, `${route}.html`)
  if (!existsSync(html)) {
    missing.push(`page ${route} (from ${file})`)
    continue
  }
  const image = (await readFile(html, 'utf8')).match(ogImage)?.[1]
  if (!image) {
    missing.push(`og:image on ${route}`)
    continue
  }
  const path = decodeURIComponent(new URL(image).pathname)
  if (!existsSync(join(outDir, path))) missing.push(`og:image file ${path} for ${route}`)
}

const registryFiles = existsSync(registryDir)
  ? (await readdir(registryDir)).filter((file) => file.endsWith('.json'))
  : []
for (const file of registryFiles) {
  if (!existsSync(join(outDir, 'r', file))) missing.push(`registry file /r/${file}`)
}

if (!existsSync(join(outDir, 'search.json'))) missing.push('search index /search.json')

if (missing.length > 0) {
  console.error(`check-output: ${missing.length} missing`)
  for (const entry of missing) console.error(`  • ${entry}`)
  process.exit(1)
}

console.log(`check-output: ${pages.length} page(s) and ${registryFiles.length} registry file(s) present`)
