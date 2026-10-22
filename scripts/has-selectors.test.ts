import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

// A :has() whose element is not the one being styled (`.group:has(x) .child`)
// makes Chrome restyle the whole subtree of any :has() anchor above a node that
// is inserted or removed: a page wrapped in a `:has()` rule recalculated every
// element on each list row it mounted. A :has() on the styled element itself
// stays cheap, so components put it on the group and hand the result down
// through a custom property, a peer or a data attribute.

const root = fileURLToPath(new URL('..', import.meta.url))

const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return name === 'node_modules' || name === 'generated' ? [] : files(path)
    return /\.(vue|ts)$/.test(name) ? [path] : []
  })

const sources = ['packages/registry/src', 'apps/docs/app'].flatMap((dir) => files(join(root, dir)))

const offenders = (pattern: RegExp) =>
  sources.flatMap((path) =>
    readFileSync(path, 'utf8')
      .split('\n')
      .flatMap((line, index) => (pattern.test(line) ? [`${path.slice(root.length)}:${index + 1}`] : [])),
  )

test('styles no element through a :has() on its group or peer', () => {
  assert.deepEqual(offenders(/\b(group|peer)-has-/), [])
})

test('styles no children through a :has() variant on their parent', () => {
  assert.deepEqual(offenders(/\bhas-(\[(?:[^[\]\s]|\[[^\]\s]*\])*\]|[\w-]+)(\/[\w-]+)?:\*{1,2}:/), [])
})

test('puts :has() in arbitrary variants on the styled element only', () => {
  assert.deepEqual(offenders(/\[[^\]\s]*:has\([^\s]*[\s_>+~][^\]\s]*&\]:/), [])
})
