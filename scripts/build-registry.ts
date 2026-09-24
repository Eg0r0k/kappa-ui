import { existsSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const HOMEPAGE = (process.env.DELTA_UI_URL ?? 'https://delta-ui.dev').replace(/\/+$/, '')

const REGISTRY_SCHEMA = 'https://shadcn-vue.com/schema/registry.json'
const ITEM_SCHEMA = 'https://shadcn-vue.com/schema/registry-item.json'

const REGISTRY_BASE = `${HOMEPAGE}/r`

const ITEM_TYPES = new Set([
  'registry:block',
  'registry:component',
  'registry:lib',
  'registry:hook',
  'registry:ui',
  'registry:page',
  'registry:file',
  'registry:theme',
  'registry:item',
])

const TARGET_REQUIRED = new Set(['registry:page', 'registry:file'])

type RegistryFile = {
  path: string
  type: string
  target?: string
}

type CssVars = {
  theme?: Record<string, string>
  light?: Record<string, string>
  dark?: Record<string, string>
}

type CssRules = { [key: string]: string | CssRules }

type RegistryItem = {
  name: string
  type: string
  title: string
  description: string
  files: RegistryFile[]
  author?: string
  dependencies?: string[]
  registryDependencies?: string[]
  cssVars?: CssVars
  css?: CssRules
  categories?: string[]
  docs?: string
}

type Registry = {
  name: string
  items: RegistryItem[]
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const { values } = parseArgs({
  options: {
    manifest: { type: 'string', default: 'packages/registry/registry.json' },
    out: { type: 'string', default: 'apps/docs/public/r' },
  },
})

const manifestPath = resolve(repoRoot, values.manifest as string)
const outDir = resolve(repoRoot, values.out as string)
const manifestDir = dirname(manifestPath)

const toDependencyUrl = (dependency: string) =>
  dependency.startsWith('http://') || dependency.startsWith('https://')
    ? dependency
    : `${REGISTRY_BASE}/${dependency}.json`

const abort = (messages: string[]): never => {
  console.error(`build-registry: ${messages.length} error(s)`)
  for (const message of messages) {
    console.error(`  • ${message}`)
  }
  process.exit(1)
}

if (!existsSync(manifestPath)) {
  abort([`manifest not found: ${values.manifest}`])
}

const registry = JSON.parse(await readFile(manifestPath, 'utf8')) as Registry

const errors: string[] = []
const names = new Set<string>()

for (const item of registry.items) {
  if (names.has(item.name)) {
    errors.push(`item "${item.name}": duplicate name in the manifest`)
  }
  names.add(item.name)

  if (!ITEM_TYPES.has(item.type)) {
    errors.push(`item "${item.name}": invalid type "${item.type}"`)
  }

  if (!/^[a-z0-9-]+$/.test(item.name)) {
    errors.push(
      `item "${item.name}": name must contain only lowercase letters, digits and hyphens`,
    )
  }

  const cssVars: CssVars = item.cssVars ?? {}
  for (const group of Object.keys(cssVars) as (keyof CssVars)[]) {
    for (const key of Object.keys(cssVars[group] ?? {})) {
      if (key.startsWith('--')) {
        errors.push(`item "${item.name}", cssVars.${group}: key "${key}" must not start with "--"`)
      }
    }
  }

  const isExample = item.categories?.includes('example') ?? false
  if (isExample) {
    if (item.type !== 'registry:block') {
      errors.push(`item "${item.name}": an example must be of type registry:block`)
    }
    if ((item.registryDependencies ?? []).length === 0) {
      errors.push(
        `item "${item.name}": an example must list the item it demonstrates in registryDependencies`,
      )
    }
  }

  for (const file of item.files) {
    if (!ITEM_TYPES.has(file.type)) {
      errors.push(`item "${item.name}", file "${file.path}": invalid type "${file.type}"`)
    }
    if (TARGET_REQUIRED.has(file.type) && !file.target) {
      errors.push(
        `item "${item.name}", file "${file.path}": type "${file.type}" requires a target field`,
      )
    }
    if (isExample && !file.path.startsWith('src/examples/')) {
      errors.push(
        `item "${item.name}", file "${file.path}": example files must live under src/examples/`,
      )
    }
    if (!existsSync(resolve(manifestDir, file.path))) {
      errors.push(`item "${item.name}": file not found — ${file.path}`)
    }
  }
}

for (const item of registry.items) {
  for (const dependency of item.registryDependencies ?? []) {
    if (dependency.startsWith('http://') || dependency.startsWith('https://')) {
      continue
    }
    if (!names.has(dependency)) {
      errors.push(
        `item "${item.name}": registryDependencies references "${dependency}", which is not in the manifest`,
      )
    }
  }
}

if (errors.length > 0) {
  abort(errors)
}

if (outDir === repoRoot || dirname(outDir) === outDir) {
  abort([`--out points at a root (${outDir}); refusing to delete it`])
}

await rm(outDir, { recursive: true, force: true })
await mkdir(outDir, { recursive: true })

for (const item of registry.items) {
  const files: (RegistryFile & { content: string })[] = []
  for (const file of item.files) {
    files.push({
      ...file,
      content: await readFile(resolve(manifestDir, file.path), 'utf8'),
    })
  }

  const registryDependencies = item.registryDependencies?.map(toDependencyUrl)

  await writeFile(
    join(outDir, `${item.name}.json`),
    `${JSON.stringify(
      { $schema: ITEM_SCHEMA, ...item, ...(registryDependencies ? { registryDependencies } : {}), files },
      null,
      2,
    )}\n`,
    'utf8',
  )
}

await writeFile(
  join(outDir, 'registry.json'),
  `${JSON.stringify(
    {
      $schema: REGISTRY_SCHEMA,
      name: registry.name,
      homepage: HOMEPAGE,
      items: registry.items,
    },
    null,
    2,
  )}\n`,
  'utf8',
)

console.log(`build-registry: wrote ${registry.items.length} item(s) → ${values.out}`)
for (const item of registry.items) {
  console.log(`  • ${item.name} (${item.files.length} file(s))`)
}
