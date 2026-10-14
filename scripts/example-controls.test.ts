import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  type ControlEntry,
  type ResolveInput,
  markedTags,
  propValues,
  resolveExampleControls,
} from './lib/example-controls.ts'

const enumOf = (...members: string[]) => ({
  kind: 'enum',
  schema: Object.fromEntries(['undefined', ...members].map((member, index) => [index, member])),
})

const buttonProps = [
  { name: 'variant', default: '"solid"', schema: enumOf('null', '"solid"', '"soft"') },
  { name: 'size', default: '"md"', schema: enumOf('"md"', '"xs"', '"sm"', '"lg"', '"xl"', '"icon-sm"') },
  { name: 'disabled', schema: enumOf('false', 'true') },
  { name: 'label', schema: 'string' },
]

const source = (body: string) =>
  `<script setup lang="ts">\ndefineOptions({ inheritAttrs: false });\n</script>\n\n<template>\n  ${body}\n</template>\n`

const resolve = (
  controls: unknown[],
  body = '<Button v-bind="$attrs">Button</Button>',
  extra: Partial<ResolveInput> = {},
) =>
  resolveExampleControls({
    items: [
      {
        name: 'button-demo',
        files: [{ path: 'src/examples/button/ButtonDemo.vue' }],
        meta: { demo: { controls: controls as ControlEntry[] } },
      },
    ],
    uiFiles: ['ui/button/Button.vue', 'ui/tabs/TabsList.vue'],
    getMeta: () => ({ props: buttonProps }),
    readSource: async () => source(body),
    ...extra,
  })

test('reads string literals and booleans from the schema', () => {
  assert.deepEqual(propValues(enumOf('null', '"solid"', '"soft"')), ['solid', 'soft'])
  assert.deepEqual(propValues(enumOf('false', 'true')), [false, true])
  assert.deepEqual(propValues('boolean'), [false, true])
  assert.equal(propValues('string'), undefined)
  assert.equal(propValues({ kind: 'enum', schema: { 0: 'undefined', 1: { kind: 'object' } } }), undefined)
})

test('sorts size steps along the scale', () => {
  assert.deepEqual(propValues(enumOf('"md"', '"icon-sm"', '"xs"', '"xl"')), ['xs', 'md', 'xl', 'icon-sm'])
})

test('finds the marked tag', () => {
  assert.deepEqual(markedTags('<Tabs>\n  <TabsList v-bind="$attrs" class="w-full">'), ['TabsList'])
  assert.deepEqual(markedTags('<Button>Button</Button>'), [])
  assert.deepEqual(markedTags('<DataTable :get-row-id="(row) => row.id" v-bind="$attrs" />'), ['DataTable'])
})

test('resolves values and defaults in the listed order, narrowed where asked', async () => {
  const { controls, errors } = await resolve(['disabled', { prop: 'size', values: ['sm', 'md', 'lg'] }, 'variant'])
  assert.deepEqual(errors, [])
  assert.deepEqual(controls['button-demo'], {
    component: 'Button',
    controls: [
      { prop: 'disabled', values: [false, true], default: false },
      { prop: 'size', values: ['sm', 'md', 'lg'], default: 'md' },
      { prop: 'variant', values: ['solid', 'soft'], default: 'solid' },
    ],
  })
})

test('falls back to md for a size without a default', async () => {
  const { controls } = await resolve(['size'], '<Button v-bind="$attrs">Button</Button>', {
    getMeta: () => ({ props: [{ name: 'size', schema: enumOf('"xs"', '"md"', '"lg"') }] }),
  })
  assert.equal(controls['button-demo']?.controls[0]?.default, 'md')
})

test('falls back to the first value when a prop has no default', async () => {
  const { controls } = await resolve(['variant'], '<Button v-bind="$attrs">Button</Button>', {
    getMeta: () => ({ props: [{ name: 'variant', schema: enumOf('"default"', '"inset"') }] }),
  })
  assert.equal(controls['button-demo']?.controls[0]?.default, 'default')
})

test('reports every mistake with the example name', async () => {
  const cases: [unknown[], string, RegExp][] = [
    [['variant'], '<Button>Button</Button>', /button-demo: needs exactly one v-bind="\$attrs" marker, found 0/],
    [['variant'], '<Card v-bind="$attrs" />', /button-demo: <Card> is not a registry component/],
    [['missing'], '<Button v-bind="$attrs" />', /button-demo: Button has no prop "missing"/],
    [['label'], '<Button v-bind="$attrs" />', /button-demo: Button\.label is not enumerable or boolean/],
    [
      [{ prop: 'size', values: ['huge'] }],
      '<Button v-bind="$attrs" />',
      /button-demo: Button\.size has no value "huge"/,
    ],
    [
      [{ prop: 'size', values: ['sm', 'lg'] }],
      '<Button v-bind="$attrs" />',
      /button-demo: Button\.size leaves out its default "md"/,
    ],
  ]
  for (const [controls, body, message] of cases) {
    const { errors } = await resolve(controls, body)
    assert.match(errors.join('\n'), message)
  }
})

test('needs the inheritAttrs line next to the marker', async () => {
  const { errors } = await resolve(['variant'], '', {
    readSource: async () => '<template>\n  <Button v-bind="$attrs" />\n</template>\n',
  })
  assert.match(errors.join('\n'), /button-demo: a marked example needs defineOptions\(\{ inheritAttrs: false \}\)/)
})

test('offers a native attribute as a boolean without reading the meta', async () => {
  const { controls, errors } = await resolve([{ attribute: 'disabled' }, 'variant'])
  assert.deepEqual(errors, [])
  assert.deepEqual(controls['button-demo']?.controls[0], { prop: 'disabled', values: [false, true], default: false })
})

test('skips items without controls', async () => {
  const { controls, errors } = await resolveExampleControls({
    items: [{ name: 'plain', files: [{ path: 'src/examples/x/X.vue' }] }],
    uiFiles: [],
    getMeta: () => ({ props: [] }),
    readSource: async () => '',
  })
  assert.deepEqual(controls, {})
  assert.deepEqual(errors, [])
})

test('takes the default from what the marked tag sets, so a narrowed list may leave out the prop default', async () => {
  const { controls, errors } = await resolve(
    [{ prop: 'size', values: ['sm', 'lg'] }, 'disabled'],
    '<Button size="lg" disabled v-bind="$attrs">Button</Button>',
  )
  assert.deepEqual(errors, [])
  assert.deepEqual(controls['button-demo']?.controls, [
    { prop: 'size', values: ['sm', 'lg'], default: 'lg' },
    { prop: 'disabled', values: [false, true], default: true },
  ])
})

test('ignores a bound attribute on the marked tag', async () => {
  const { controls } = await resolve(['size'], '<Button :size="size" v-bind="$attrs">Button</Button>')
  assert.equal(controls['button-demo']?.controls[0]?.default, 'md')
})
