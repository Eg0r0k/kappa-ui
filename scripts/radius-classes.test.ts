import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))

const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return name === 'node_modules' || name === 'generated' ? [] : files(path)
    return /\.(vue|ts)$/.test(name) ? [path] : []
  })

const sources = ['packages/registry/src', 'apps/docs/app'].flatMap((dir) => files(join(root, dir)))

const offenders = (pattern: RegExp) =>
  sources.filter((path) => pattern.test(readFileSync(path, 'utf8'))).map((path) => path.slice(root.length))

test('writes nested radii with the nesting utilities, not by hand', () => {
  assert.deepEqual(offenders(/rounded(-[a-z]{1,2})?-\[(max\(0px|calc\(--theme\(--radius|calc\(var\(--radius)/), [])
})

test('keeps --control-radius a knob that components never assign', () => {
  assert.deepEqual(offenders(/\[--control-radius:/), [])
})
