import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sizes = ['xs', 'sm', 'md', 'lg', 'xl']
const steps = {
  height: [7, 8, 9, 10, 12],
  padding: [2, 2.5, 3, 3, 4],
  icon: [3.5, 4, 4, 5, 5],
  gap: [1.5, 2, 2, 2.5, 3],
}
const token = /--control-(?:height|padding|icon|gap)-[\w-]+/g

const declared = new Map(
  [
    ...readFileSync(join(repoRoot, 'packages/core/src/tokens.css'), 'utf8').matchAll(/(--control-[\w-]+):\s*([^;]+);/g),
  ].map(([, name, value]) => [name, value]),
)

const sources = (dir: string, files = /\.(ts|vue)$/): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return sources(path, files)
    return files.test(entry.name) ? [path] : []
  })

test('tokens.css declares the control scale in spacing steps', () => {
  const expected = Object.entries(steps).flatMap(([kind, values]) =>
    sizes.map((size, index) => [`--control-${kind}-${size}`, `calc(var(--spacing) * ${values[index]})`]),
  )
  assert.deepEqual([...declared], expected)
})

test('every control token the registry reads is declared', () => {
  const used = new Set(
    sources(join(repoRoot, 'packages/registry/src')).flatMap((file) => readFileSync(file, 'utf8').match(token) ?? []),
  )
  assert.deepEqual(
    [...used].filter((name) => !declared.has(name)),
    [],
  )
})

test('no size is named default or icon: sizes run xs to xl, icon-xs to icon-xl', () => {
  const files = ['packages/registry/src', 'apps/docs/app', 'apps/docs/content'].flatMap((dir) =>
    sources(join(repoRoot, dir), /\.(ts|vue|md)$/),
  )
  const retired = /\bsize(?:=|:\s*)["'](?:default|icon)["']/
  assert.deepEqual(
    files.filter((file) => retired.test(readFileSync(file, 'utf8'))).map((file) => relative(repoRoot, file)),
    [],
  )
})
