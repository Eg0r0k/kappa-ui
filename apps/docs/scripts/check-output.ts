import { existsSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { contentFileToRoute } from './lib/routes.ts'

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const contentDir = join(docsRoot, 'content/docs')
const registryDir = join(docsRoot, 'public/r')
const outDir = join(docsRoot, '.output/public')

const missing: string[] = []

const pages = (await readdir(contentDir, { recursive: true })).filter((file) => file.endsWith('.md'))
for (const file of pages) {
  const route = contentFileToRoute(file)
  if (!existsSync(join(outDir, route, 'index.html'))) missing.push(`page ${route} (from ${file})`)
}

const registryFiles = existsSync(registryDir)
  ? (await readdir(registryDir)).filter((file) => file.endsWith('.json'))
  : []
for (const file of registryFiles) {
  if (!existsSync(join(outDir, 'r', file))) missing.push(`registry file /r/${file}`)
}

if (missing.length > 0) {
  console.error(`check-output: ${missing.length} missing`)
  for (const entry of missing) console.error(`  • ${entry}`)
  process.exit(1)
}

console.log(`check-output: ${pages.length} page(s) and ${registryFiles.length} registry file(s) present`)
