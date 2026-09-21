import { existsSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

// Placeholder. Deploying the showcase changes this one line and nothing else.
const HOMEPAGE = 'https://delta-ui.dev'

const REGISTRY_SCHEMA = 'https://shadcn-vue.com/schema/registry.json'
const ITEM_SCHEMA = 'https://shadcn-vue.com/schema/registry-item.json'

// The `/r` path is hardcoded and must stay in step with the default `--out`
// (`apps/docs/public/r`) — that is the same tree, served over HTTP.
const REGISTRY_BASE = `${HOMEPAGE}/r`

const ITEM_TYPES = new Set([
  'registry:block',
  'registry:component',
  'registry:lib',
  'registry:hook',
  'registry:ui',
  'registry:page',
  'registry:file',
])

const TARGET_REQUIRED = new Set(['registry:page', 'registry:file'])

type RegistryFile = {
  path: string
  type: string
  target?: string
}

// The consumer's CLI routes each group to a different place in their CSS:
// theme → @theme inline, light → :root, dark → .dark.
type CssVars = {
  theme?: Record<string, string>
  light?: Record<string, string>
  dark?: Record<string, string>
}

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

function toDependencyUrl(dependency: string) {
  return dependency.startsWith('http://') || dependency.startsWith('https://')
    ? dependency
    : `${REGISTRY_BASE}/${dependency}.json`
}

function abort(messages: string[]): never {
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

  // The CLI adds the "--" prefix itself. A key of "--radius" would silently
  // become "----radius".
  const cssVars: CssVars = item.cssVars ?? {}
  for (const group of Object.keys(cssVars) as (keyof CssVars)[]) {
    for (const key of Object.keys(cssVars[group] ?? {})) {
      if (key.startsWith('--')) {
        errors.push(`item "${item.name}", cssVars.${group}: key "${key}" must not start with "--"`)
      }
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
    if (!existsSync(resolve(manifestDir, file.path))) {
      errors.push(`item "${item.name}": file not found — ${file.path}`)
    }
  }
}

// A separate pass: an item may reference another declared later in the list.
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

// The directory is wiped wholesale, otherwise an item removed from the
// manifest would stay published.
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
