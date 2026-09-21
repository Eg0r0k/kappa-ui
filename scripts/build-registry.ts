import { existsSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

// Плейсхолдер. При деплое витрины меняется только эта строка.
const HOMEPAGE = 'https://delta-ui.dev'

const REGISTRY_SCHEMA = 'https://shadcn-vue.com/schema/registry.json'
const ITEM_SCHEMA = 'https://shadcn-vue.com/schema/registry-item.json'

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

type RegistryItem = {
  name: string
  type: string
  title: string
  description: string
  files: RegistryFile[]
  author?: string
  dependencies?: string[]
  registryDependencies?: string[]
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

function abort(messages: string[]): never {
  console.error(`build-registry: ошибок — ${messages.length}`)
  for (const message of messages) {
    console.error(`  • ${message}`)
  }
  process.exit(1)
}

if (!existsSync(manifestPath)) {
  abort([`манифест не найден: ${values.manifest}`])
}

const registry = JSON.parse(await readFile(manifestPath, 'utf8')) as Registry

const errors: string[] = []
const names = new Set<string>()

for (const item of registry.items) {
  if (names.has(item.name)) {
    errors.push(`item "${item.name}": имя повторяется в манифесте`)
  }
  names.add(item.name)

  if (!ITEM_TYPES.has(item.type)) {
    errors.push(`item "${item.name}": недопустимый type "${item.type}"`)
  }

  for (const file of item.files) {
    if (!ITEM_TYPES.has(file.type)) {
      errors.push(`item "${item.name}", файл "${file.path}": недопустимый type "${file.type}"`)
    }
    if (TARGET_REQUIRED.has(file.type) && !file.target) {
      errors.push(
        `item "${item.name}", файл "${file.path}": для type "${file.type}" обязательно поле target`,
      )
    }
    if (!existsSync(resolve(manifestDir, file.path))) {
      errors.push(`item "${item.name}": файл не найден — ${file.path}`)
    }
  }
}

// Отдельным проходом: ссылаться можно и на item, объявленный ниже по списку.
for (const item of registry.items) {
  for (const dependency of item.registryDependencies ?? []) {
    if (dependency.startsWith('http://') || dependency.startsWith('https://')) {
      continue
    }
    if (!names.has(dependency)) {
      errors.push(
        `item "${item.name}": registryDependencies ссылается на "${dependency}", которого нет в манифесте`,
      )
    }
  }
}

if (errors.length > 0) {
  abort(errors)
}

// Каталог очищается целиком, иначе удалённый из манифеста item остался бы
// опубликованным.
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

  await writeFile(
    join(outDir, `${item.name}.json`),
    `${JSON.stringify({ $schema: ITEM_SCHEMA, ...item, files }, null, 2)}\n`,
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

console.log(`build-registry: записано items — ${registry.items.length} → ${values.out}`)
for (const item of registry.items) {
  console.log(`  • ${item.name} (${item.files.length} файл(ов))`)
}
