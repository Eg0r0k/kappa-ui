import assert from 'node:assert/strict'
import { dirname, resolve } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

import { ESLint } from 'eslint'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const eslint = new ESLint({ cwd: repoRoot })

const errors = async (code: string, file: string, rule?: string) => {
  const [result] = await eslint.lintText(code, { filePath: resolve(repoRoot, file) })
  return (result?.messages ?? [])
    .filter((message) => message.severity === 2 && (rule === undefined || message.ruleId === rule))
    .map((message) => ({ rule: message.ruleId, text: message.message }))
}

const sfc = (source: string) => `<script setup lang="ts">\n${source}\n</script>\n\n<template><div /></template>\n`

const template = (markup: string) => `<template>\n  ${markup}\n</template>\n`

const restricted = (code: string, file: string) => errors(code, file, 'no-restricted-imports')

const assertRejected = (found: { rule: string | null; text: string }[]) => {
  assert.equal(found.length, 1, JSON.stringify(found))
  assert.match(found[0]?.text ?? '', /Only @kappa-ui\/core may import reka-ui\/internal\./)
}

test('accepts reka-ui in registry sources', async () => {
  assert.deepEqual(await restricted('import { useId } from "reka-ui";\n', 'packages/registry/src/lib/probe.ts'), [])
  assert.deepEqual(
    await restricted(sfc('import type { LabelProps } from "reka-ui";'), 'packages/registry/src/ui/probe/Probe.vue'),
    [],
  )
})

test('rejects reka-ui/internal in registry sources', async () => {
  assertRejected(
    await restricted(sfc('import { MenuRoot } from "reka-ui/internal";'), 'packages/registry/src/ui/probe/Probe.vue'),
  )
  assertRejected(
    await restricted('import type { MenuItemProps } from "reka-ui/internal";\n', 'packages/registry/src/lib/probe.ts'),
  )
})

test('leaves core alone', async () => {
  assert.deepEqual(
    await restricted('export { MenuRoot } from "reka-ui/internal";\n', 'packages/core/src/menu/probe.ts'),
    [],
  )
})

test('rejects an unknown Tailwind class in a registry component', async () => {
  const found = await errors(
    template('<div class="text-body-xxl" />'),
    'packages/registry/src/ui/probe/Probe.vue',
    'better-tailwindcss/no-unknown-classes',
  )
  assert.equal(found.length, 1, JSON.stringify(found))
})

test('accepts theme tokens and hook classes in a registry component', async () => {
  assert.deepEqual(
    await errors(
      template('<div class="kappa-probe bg-card text-body-md text-muted-foreground duration-short-4 ease-standard" />'),
      'packages/registry/src/ui/probe/Probe.vue',
    ),
    [],
  )
})

test('rejects an unknown Tailwind class in a docs component', async () => {
  const found = await errors(
    template('<div class="text-body-xxl" />'),
    'apps/docs/app/components/Probe.vue',
    'better-tailwindcss/no-unknown-classes',
  )
  assert.equal(found.length, 1, JSON.stringify(found))
})

test('reports an unused variable in core sources, but not a rest sibling', async () => {
  const found = await errors(
    'export const probe = (props: { class: string; id: string }) => {\n  const unused = 1\n  const { class: _, ...rest } = props\n  return rest\n}\n',
    'packages/core/src/primitives/probe.ts',
    '@typescript-eslint/no-unused-vars',
  )
  assert.deepEqual(
    found.map((message) => message.text),
    ["'unused' is assigned a value but never used."],
  )
})
