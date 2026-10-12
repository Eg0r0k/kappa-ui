import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { getComponentMeta } from 'nuxt-component-meta/parser'
import { parse } from 'yaml'

import { resolveExampleControls } from '../../../scripts/lib/example-controls.ts'
import { mergeApi, type ApiDescriptions, type ComponentApi } from './lib/api-meta.ts'
import { typeMembers } from './lib/type-members.ts'

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const registryRoot = resolve(docsRoot, '../../packages/registry')
const registrySrc = join(registryRoot, 'src')
const apiDir = join(docsRoot, 'api')
const outFile = join(docsRoot, 'app/generated/api.json')
const controlsFile = join(docsRoot, 'app/generated/controls.json')

const abort = (messages: string[]): never => {
  console.error(`build-api: ${messages.length} error(s)`)
  for (const message of messages) console.error(`  • ${message}`)
  process.exit(1)
}

const componentFiles = (await readdir(join(registrySrc, 'ui'), { recursive: true }))
  .filter((file) => file.endsWith('.vue'))
  .map((file) => `ui/${file.replaceAll('\\', '/')}`)

const descriptions = await Promise.all(
  (await readdir(apiDir))
    .filter((file) => file.endsWith('.yml'))
    .map(async (file) => parse(await readFile(join(apiDir, file), 'utf8')) as ApiDescriptions),
)

const errors: string[] = []
const describedFiles = new Set(descriptions.map((entry) => entry.file))
for (const file of componentFiles) {
  if (!describedFiles.has(file)) errors.push(`${file} has no description file in apps/docs/api`)
}
const names = new Set<string>()
for (const entry of descriptions) {
  if (!componentFiles.includes(entry.file)) {
    errors.push(`${entry.component}: file "${entry.file}" does not exist under packages/registry/src`)
  }
  if (names.has(entry.component)) errors.push(`${entry.component}: described twice`)
  names.add(entry.component)
}
if (errors.length > 0) abort(errors)

const output: Record<string, ComponentApi> = {}
for (const entry of descriptions) {
  const meta = getComponentMeta(join(registrySrc, entry.file), { rootDir: registryRoot })
  const exposed = entry.exposedType
    ? typeMembers(registryRoot, entry.exposedType.file, entry.exposedType.name)
    : meta.exposed
  const merged = mergeApi({ ...meta, exposed }, entry)
  errors.push(...merged.errors)
  output[entry.component] = merged.api
}
if (errors.length > 0) abort(errors)

const manifest = JSON.parse(await readFile(join(registryRoot, 'registry.json'), 'utf8')) as {
  items: Parameters<typeof resolveExampleControls>[0]['items']
}
const controls = await resolveExampleControls({
  items: manifest.items,
  uiFiles: componentFiles,
  getMeta: (file) => getComponentMeta(join(registrySrc, file), { rootDir: registryRoot }),
  readSource: (path) => readFile(join(registryRoot, path), 'utf8'),
})
if (controls.errors.length > 0) abort(controls.errors)

await mkdir(dirname(outFile), { recursive: true })
await writeFile(outFile, `${JSON.stringify(output, null, 2)}\n`, 'utf8')
await writeFile(controlsFile, `${JSON.stringify(controls.controls, null, 2)}\n`, 'utf8')
console.log(`build-api: wrote ${descriptions.length} component(s) → apps/docs/app/generated/api.json and controls.json`)
