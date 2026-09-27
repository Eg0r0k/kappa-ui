import { existsSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const HOMEPAGE = (process.env.KAPPA_UI_URL ?? 'https://kappa-ui.pages.dev').replace(/\/+$/, '')

const REGISTRY_SCHEMA = 'https://shadcn-vue.com/schema/registry.json'
const ITEM_SCHEMA = 'https://shadcn-vue.com/schema/registry-item.json'

const REGISTRY_BASE = `${HOMEPAGE}/r`

const CORE_PACKAGE = '@kappa-ui/core'
const REGISTRY_NAMESPACE = '@kappa-ui'
const PUBLISHED_ALIAS = '@/registry/kappa-ui/'
const publishedPath = (path: string) => path.replace(/^src\/examples\//, 'components/examples/')
const IMPLICIT_PACKAGES = new Set(['vue'])
const SPECIFIER = /(?<![.\w$])(from\s*|import\s*\(\s*|import\s+)(["'])([^"'\n]+)\2/g
const SCRIPT_FILE = /\.(ts|vue)$/
const SCRIPT_BLOCK = /<script\b[^>]*>[\s\S]*?<\/script>/g

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
  'registry:base',
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
  extends?: string
  config?: Record<string, unknown>
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
    core: { type: 'string', default: 'packages/core/package.json' },
  },
})

const manifestPath = resolve(repoRoot, values.manifest as string)
const outDir = resolve(repoRoot, values.out as string)
const manifestDir = dirname(manifestPath)
const corePath = resolve(repoRoot, values.core as string)

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

const shipsMechanism = (rules: CssRules = {}): boolean =>
  Object.entries(rules).some(
    ([key, body]) =>
      key.startsWith('@utility') || key.startsWith('@keyframes') || (typeof body === 'object' && shipsMechanism(body)),
  )

const packageOf = (specifier: string) =>
  specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : (specifier.split('/')[0] ?? specifier)

const withoutVersion = (dependency: string) => dependency.replace(/(.)@.*$/, '$1')

const specifiersOf = (content: string) => [...content.matchAll(SPECIFIER)].map((match) => match[3] ?? '')

const moduleCodeOf = (path: string, content: string) =>
  path.endsWith('.vue') ? [...content.matchAll(SCRIPT_BLOCK)].map((match) => match[0]).join('\n') : content

const rewriteSpecifiers = (code: string) =>
  code.replace(SPECIFIER, (match: string, lead: string, quote: string, specifier: string) =>
    specifier.startsWith('@/') ? `${lead}${quote}${PUBLISHED_ALIAS}${specifier.slice(2)}${quote}` : match,
  )

const publishedContent = (path: string, content: string) =>
  path.endsWith('.vue')
    ? content.replace(SCRIPT_BLOCK, rewriteSpecifiers)
    : SCRIPT_FILE.test(path)
      ? rewriteSpecifiers(content)
      : content

if (!existsSync(manifestPath)) {
  abort([`manifest not found: ${values.manifest}`])
}

if (!existsSync(corePath)) {
  abort([`core package not found: ${values.core}`])
}

const registry = JSON.parse(await readFile(manifestPath, 'utf8')) as Registry

const coreVersion = (JSON.parse(await readFile(corePath, 'utf8')) as { version: string }).version

const stamp = (dependencies?: string[]) =>
  dependencies?.map((dependency) => (dependency === CORE_PACKAGE ? `${CORE_PACKAGE}@^${coreVersion}` : dependency))

const publishedConfig = (item: RegistryItem) =>
  item.type === 'registry:base'
    ? {
        ...item.config,
        registries: {
          ...(item.config?.registries as Record<string, string> | undefined),
          [REGISTRY_NAMESPACE]: `${REGISTRY_BASE}/{name}.json`,
        },
      }
    : undefined

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
    errors.push(`item "${item.name}": name must contain only lowercase letters, digits and hyphens`)
  }

  const cssVars: CssVars = item.cssVars ?? {}
  for (const group of Object.keys(cssVars) as (keyof CssVars)[]) {
    for (const key of Object.keys(cssVars[group] ?? {})) {
      if (key.startsWith('--')) {
        errors.push(`item "${item.name}", cssVars.${group}: key "${key}" must not start with "--"`)
      }
    }
  }

  if (item.type === 'registry:base' && (typeof item.config !== 'object' || item.config === null)) {
    errors.push(`item "${item.name}": registry:base needs a config object`)
  }
  if (item.type !== 'registry:base' && item.config !== undefined) {
    errors.push(`item "${item.name}": config is only allowed on registry:base`)
  }

  if (shipsMechanism(item.css)) {
    errors.push(`item "${item.name}": @utility and @keyframes belong in @kappa-ui/core/tailwind.css`)
  }

  for (const dependency of item.dependencies ?? []) {
    if (dependency.startsWith(`${CORE_PACKAGE}@`)) {
      errors.push(
        `item "${item.name}": list "${CORE_PACKAGE}" without a version; the build stamps it from packages/core/package.json`,
      )
    }
  }

  const isExample = item.categories?.includes('example') ?? false
  if (isExample) {
    if (item.type !== 'registry:block') {
      errors.push(`item "${item.name}": an example must be of type registry:block`)
    }
    if ((item.registryDependencies ?? []).length === 0) {
      errors.push(`item "${item.name}": an example must list the item it demonstrates in registryDependencies`)
    }
  }

  for (const file of item.files) {
    if (!ITEM_TYPES.has(file.type)) {
      errors.push(`item "${item.name}", file "${file.path}": invalid type "${file.type}"`)
    }
    if (TARGET_REQUIRED.has(file.type) && !file.target) {
      errors.push(`item "${item.name}", file "${file.path}": type "${file.type}" requires a target field`)
    }
    if (isExample && !file.path.startsWith('src/examples/')) {
      errors.push(`item "${item.name}", file "${file.path}": example files must live under src/examples/`)
    }
    const filePath = resolve(manifestDir, file.path)
    if (!existsSync(filePath)) {
      errors.push(`item "${item.name}": file not found — ${file.path}`)
    } else if (file.path.endsWith('.css')) {
      const content = await readFile(filePath, 'utf8')
      if (/@utility\b/.test(content) || /@keyframes\b/.test(content)) {
        errors.push(
          `item "${item.name}", file "${file.path}": @utility and @keyframes belong in @kappa-ui/core/tailwind.css`,
        )
      }
    }
  }
}

for (const item of registry.items) {
  for (const dependency of item.registryDependencies ?? []) {
    if (dependency.startsWith('http://') || dependency.startsWith('https://')) {
      continue
    }
    if (!names.has(dependency)) {
      errors.push(`item "${item.name}": registryDependencies references "${dependency}", which is not in the manifest`)
    }
  }
}

const byName = new Map(registry.items.map((item) => [item.name, item]))

const treeOf = (name: string, seen: Set<string> = new Set()): Set<string> => {
  const item = byName.get(name)
  if (!item || seen.has(name)) return seen
  seen.add(name)
  for (const dependency of item.registryDependencies ?? []) treeOf(dependency, seen)
  return seen
}

for (const item of registry.items) {
  const tree = [...treeOf(item.name)].flatMap((name) => byName.get(name) ?? [])
  const shipped = new Set(tree.flatMap((entry) => entry.files.map((file) => resolve(manifestDir, file.path))))
  const packages = new Set(tree.flatMap((entry) => entry.dependencies ?? []).map(withoutVersion))
  for (const file of item.files) {
    const filePath = resolve(manifestDir, file.path)
    if (!SCRIPT_FILE.test(file.path) || !existsSync(filePath)) continue
    for (const specifier of specifiersOf(moduleCodeOf(file.path, await readFile(filePath, 'utf8')))) {
      const local = specifier.startsWith('.')
        ? resolve(dirname(filePath), specifier)
        : specifier.startsWith('@/')
          ? resolve(manifestDir, 'src', specifier.slice(2))
          : null
      if (local !== null) {
        const candidates = [local, `${local}.ts`, `${local}.vue`, join(local, 'index.ts')]
        if (!candidates.some((candidate) => shipped.has(candidate))) {
          errors.push(
            `item "${item.name}", file "${file.path}": imports "${specifier}", which neither the item nor its registryDependencies ship`,
          )
        }
      } else if (!IMPLICIT_PACKAGES.has(packageOf(specifier)) && !packages.has(packageOf(specifier))) {
        errors.push(
          `item "${item.name}", file "${file.path}": imports "${specifier}", but "${packageOf(specifier)}" is not in the dependencies of the item or its registryDependencies`,
        )
      }
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
      path: publishedPath(file.path),
      content: publishedContent(file.path, await readFile(resolve(manifestDir, file.path), 'utf8')),
    })
  }

  const dependencies = stamp(item.dependencies)
  const registryDependencies = item.registryDependencies?.map(toDependencyUrl)
  const config = publishedConfig(item)

  await writeFile(
    join(outDir, `${item.name}.json`),
    `${JSON.stringify(
      {
        $schema: ITEM_SCHEMA,
        ...item,
        ...(dependencies ? { dependencies } : {}),
        ...(registryDependencies ? { registryDependencies } : {}),
        ...(config ? { config } : {}),
        files,
      },
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
      items: registry.items.map((item) => ({
        ...item,
        ...(item.dependencies ? { dependencies: stamp(item.dependencies) } : {}),
        ...(item.type === 'registry:base' ? { config: publishedConfig(item) } : {}),
        files: item.files.map((file) => ({ ...file, path: publishedPath(file.path) })),
      })),
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
