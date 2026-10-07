import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

import { bundleOf } from './bundle.ts'

const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor as new (body: string) => unknown

const runtime = (...files: string[]) =>
  files.map((file) => ({ file, source: readFileSync(new URL(`./runtime/${file}`, import.meta.url), 'utf8') }))

const unbundledImports = (...files: string[]) =>
  runtime(...files).flatMap(({ file, source }) =>
    [...source.matchAll(/^import \{[^}]*\} from '([^']+)'$/gm)]
      .map((match) => match[1]!)
      .filter((path) => !files.some((bundled) => path === `./${bundled}`))
      .map((path) => `${file} imports ${path}`),
  )

test('the tokens runtime bundles into a valid async function body', () => {
  const bundle = bundleOf(runtime('shared.ts', 'boards.ts', 'tokens.ts'), 'syncTokens', { variables: [] })
  assert.doesNotThrow(() => new AsyncFunction(bundle))
  assert.match(bundle, /return syncTokens\(\{"variables":\[\]\}\)\n$/)
})

test('the tokens runtime imports only what its bundle holds', () => {
  assert.deepEqual(unbundledImports('shared.ts', 'boards.ts', 'tokens.ts'), [])
})

test('the icons runtime bundles into a valid async function body', () => {
  const bundle = bundleOf(runtime('shared.ts', 'icons.ts'), 'syncIcons', { icons: [] })
  assert.doesNotThrow(() => new AsyncFunction(bundle))
})

test('the icons runtime imports only what its bundle holds', () => {
  assert.deepEqual(unbundledImports('shared.ts', 'icons.ts'), [])
})

test('the thumbnails runtime bundles into a valid async function body', () => {
  const bundle = bundleOf(runtime('shared.ts', 'thumbs.ts'), 'exportThumbnails', {
    endpoint: 'http://localhost/thumbs',
  })
  assert.doesNotThrow(() => new AsyncFunction(bundle))
})

test('the thumbnails runtime imports only what its bundle holds', () => {
  assert.deepEqual(unbundledImports('shared.ts', 'thumbs.ts'), [])
})
