import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { readCanvasEntries } from './lib/canvas.ts'

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outFile = join(docsRoot, 'app/assets/canvas/components.json')

const { entries, errors } = await readCanvasEntries(docsRoot)
if (errors.length > 0) {
  console.error(`build-canvas: ${errors.length} error(s)`)
  for (const message of errors) console.error(`  • ${message}`)
  process.exit(1)
}

await mkdir(dirname(outFile), { recursive: true })
await writeFile(outFile, `${JSON.stringify(entries, null, 2)}\n`, 'utf8')
console.log(`build-canvas: wrote ${entries.length} component(s) → apps/docs/app/assets/canvas/components.json`)
