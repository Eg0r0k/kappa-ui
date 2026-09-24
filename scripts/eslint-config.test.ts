import assert from 'node:assert/strict'
import { dirname, resolve } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

import { ESLint } from 'eslint'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const eslint = new ESLint({ cwd: repoRoot })

const errors = async (code: string, file: string) => {
  const [result] = await eslint.lintText(code, { filePath: resolve(repoRoot, file) })
  return (result?.messages ?? [])
    .filter((message) => message.severity === 2)
    .map((message) => ({ rule: message.ruleId, text: message.message }))
}

const sfc = (source: string) => `<script setup lang="ts">\n${source}\n</script>\n\n<template><div /></template>\n`

const assertRejected = (found: { rule: string | null; text: string }[]) => {
  assert.equal(found.length, 1, JSON.stringify(found))
  assert.equal(found[0]?.rule, 'no-restricted-imports')
  assert.match(found[0]?.text ?? '', /Import from @delta-ui\/core instead\./)
}

test('rejects reka-ui in a registry .ts file', async () => {
  assertRejected(await errors('import { useId } from "reka-ui";\n', 'packages/registry/src/lib/probe.ts'))
})

test('rejects reka-ui in a registry .vue file', async () => {
  assertRejected(await errors(sfc('import { Label } from "reka-ui";'), 'packages/registry/src/ui/probe/Probe.vue'))
})

test('rejects reka-ui/internal', async () => {
  assertRejected(
    await errors(sfc('import { MenuRoot } from "reka-ui/internal";'), 'packages/registry/src/ui/probe/Probe.vue'),
  )
})

test('rejects a type-only reka-ui import', async () => {
  assertRejected(
    await errors(sfc('import type { LabelProps } from "reka-ui";'), 'packages/registry/src/examples/probe/Probe.vue'),
  )
})

test('accepts the facade in registry sources', async () => {
  assert.deepEqual(
    await errors(sfc('import { Label } from "@delta-ui/core/label";'), 'packages/registry/src/ui/probe/Probe.vue'),
    [],
  )
})

test('leaves core and registry tests alone', async () => {
  assert.deepEqual(await errors('export { Label } from "reka-ui";\n', 'packages/core/src/primitives/probe.ts'), [])
  assert.deepEqual(await errors('import { Label } from "reka-ui";\n', 'packages/registry/test/probe.test.ts'), [])
})
