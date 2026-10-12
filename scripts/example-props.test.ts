import assert from 'node:assert/strict'
import { test } from 'node:test'

import { applyProps, kebab } from './lib/example-props.ts'

const rooted = `<script setup lang="ts">
import { Button } from "@/ui/button";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <Button v-bind="$attrs">Button</Button>
</template>
`

const nested = `<script setup lang="ts">
import { Field } from "@/ui/field";
import { Switch } from "@/ui/switch";

defineOptions({ inheritAttrs: false });

const label = "Airplane mode";
</script>

<template>
  <Field orientation="horizontal">
    <Switch v-bind="$attrs" />
  </Field>
</template>
`

test('strips the marker and its defineOptions line when no prop is set', () => {
  assert.equal(
    applyProps(rooted),
    `<script setup lang="ts">
import { Button } from "@/ui/button";
</script>

<template>
  <Button>Button</Button>
</template>
`,
  )
})

test('keeps one blank line between the imports and the code it closes up', () => {
  assert.equal(
    applyProps(nested),
    `<script setup lang="ts">
import { Field } from "@/ui/field";
import { Switch } from "@/ui/switch";

const label = "Airplane mode";
</script>

<template>
  <Field orientation="horizontal">
    <Switch />
  </Field>
</template>
`,
  )
})

test('writes props in the given order, kebab-cased', () => {
  assert.match(
    applyProps(rooted, { variant: 'soft', touchTarget: 'expand' }),
    /<Button variant="soft" touch-target="expand">Button<\/Button>/,
  )
})

test('writes true as a bare attribute and false as a bound one', () => {
  assert.match(applyProps(nested, { disabled: true }), /<Switch disabled \/>/)
  assert.match(applyProps(nested, { disabled: false }), /<Switch :disabled="false" \/>/)
})

test('leaves a source without the marker unchanged', () => {
  const plain = '<template>\n  <Button>Button</Button>\n</template>\n'
  assert.equal(applyProps(plain, { variant: 'soft' }), plain)
})

test('kebab-cases camelCase prop names', () => {
  assert.equal(kebab('touchTarget'), 'touch-target')
  assert.equal(kebab('size'), 'size')
})
