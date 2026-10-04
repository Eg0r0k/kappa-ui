import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  buildChangelog,
  exportedNames,
  parseChangelog,
  pascalName,
  releaseDate,
  type ChangelogPackage,
  type ItemTokens,
  type Release,
} from './lib/changelog.ts'

type ManifestItem = { name: string; categories?: string[]; files: { path: string }[] }

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = resolve(docsRoot, '../..')
const registryRoot = join(repoRoot, 'packages/registry')
const outFile = join(docsRoot, 'app/generated/changelog.json')

const git = (args: string[]) => execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8' })

const changelogs: [ChangelogPackage, string][] = [
  ['registry', 'packages/registry/CHANGELOG.md'],
  ['core', 'packages/core/CHANGELOG.md'],
]

const releases: Release[] = []
for (const [pkg, file] of changelogs) {
  for (const release of parseChangelog(await readFile(join(repoRoot, file), 'utf8'))) {
    const date = new Date(releaseDate(git, file, release.version)).toISOString()
    releases.push({ ...release, package: pkg, date })
  }
}

const manifest = JSON.parse(await readFile(join(registryRoot, 'registry.json'), 'utf8')) as { items: ManifestItem[] }
const items: ItemTokens[] = []
for (const item of manifest.items) {
  if (item.categories?.includes('example') ?? true) continue
  const tokens = new Set<string>()
  for (const file of item.files) {
    const source = join(registryRoot, file.path)
    if (file.path.endsWith('.ts') && existsSync(source)) {
      for (const name of exportedNames(await readFile(source, 'utf8'))) tokens.add(name)
    }
  }
  const main = pascalName(item.name)
  tokens.add(main)
  items.push({ name: item.name, main, tokens: [...tokens] })
}

const data = buildChangelog(releases, items, new Date())
await mkdir(dirname(outFile), { recursive: true })
await writeFile(outFile, `${JSON.stringify(data, null, 2)}\n`, 'utf8')

const badged = Object.values(data.items).filter((item) => item.badge).length
console.log(`build-changelog: ${releases.length} release(s), ${items.length} item(s), ${badged} badge(s)`)
