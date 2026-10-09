<script setup lang="ts">
import { computed, ref } from 'vue'

import { Badge } from '@/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Checkbox } from '@/ui/checkbox'
import { Field, FieldLabel } from '@/ui/field'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/ui/input-group'
import { InputNumber, InputNumberDecrement, InputNumberIncrement, InputNumberInput } from '@/ui/input-number'
import { Kbd } from '@/ui/kbd'
import { menuItem, menuSizeVariants } from '@/ui/menu'
import { overlaySurface } from '@/ui/popover'
import { Switch } from '@/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/ui/tabs'
import { cn } from '@/lib/utils'
import DocsFigure from '~/components/DocsFigure.vue'
import {
  type RadiusKnobs,
  type RadiusRole,
  formatPx,
  insetRadius,
  outsetRadius,
  roleRadius,
  roleSteps,
} from '~/lib/radius'

const knobs = ref<RadiusKnobs>({ base: 8, control: null, surface: null, item: null })
const showRadii = ref(false)
const outer = ref(12)
const inset = ref(6)

const roles: { key: RadiusRole; label: string }[] = [
  { key: 'control', label: 'Control' },
  { key: 'surface', label: 'Surface' },
  { key: 'item', label: 'Item' },
]

const steps = ['3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl']

const style = computed(() => ({
  '--radius': `${knobs.value.base}px`,
  ...(knobs.value.control === null ? {} : { '--control-radius': `${knobs.value.control}px` }),
  ...(knobs.value.surface === null ? {} : { '--surface-radius': `${knobs.value.surface}px` }),
  ...(knobs.value.item === null ? {} : { '--item-radius': `${knobs.value.item}px` }),
}))

const role = (key: RadiusRole, step: string) => roleRadius(knobs.value, key, step)

const hasStep = (key: RadiusRole, step: string) => roleSteps[key].some((entry) => entry.step === step)

const labels = computed(() => ({
  card: `rounded-surface-md · ${formatPx(role('surface', 'md'))}`,
  'input-group-button': `rounded-inset · ${formatPx(insetRadius(role('control', 'md'), 6))}`,
  'tabs-list': `rounded-outset · ${formatPx(outsetRadius(role('control', 'md'), 4))}`,
  'tabs-trigger': `rounded-control-md · ${formatPx(role('control', 'md'))}`,
  menu: `rounded-outset · ${formatPx(outsetRadius(role('item', 'md'), 4))}`,
  'menu-item': `rounded-item-md · ${formatPx(role('item', 'md'))}`,
  badge: `rounded-control-xs · ${formatPx(role('control', 'xs'))}`,
  checkbox: `rounded-control-3xs · ${formatPx(role('control', '3xs'))}`,
  kbd: `rounded-control-2xs · ${formatPx(role('control', '2xs'))}`,
  dialog: `rounded-surface-lg · ${formatPx(role('surface', 'lg'))}`,
}))

const floored = computed(() => outer.value - inset.value < outer.value / 2)

const setAuto = (key: RadiusRole, auto: boolean) => {
  knobs.value = { ...knobs.value, [key]: auto ? null : knobs.value.base }
}

const setKnob = (key: RadiusRole, value: number) => {
  knobs.value = { ...knobs.value, [key]: value }
}
</script>

<template>
  <DocsFigure title="Type a radius">
    <div class="grid gap-6 p-6 sm:p-8">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field data-test="knob-base">
          <FieldLabel>Base, px</FieldLabel>
          <InputNumber v-model="knobs.base" :min="0" :max="32" :step="1" size="sm">
            <InputNumberDecrement />
            <InputNumberInput aria-label="Base radius in px" />
            <InputNumberIncrement />
          </InputNumber>
        </Field>
        <Field v-for="entry in roles" :key="entry.key" :data-test="`knob-${entry.key}`">
          <div class="flex items-center justify-between gap-2">
            <FieldLabel>{{ entry.label }}, px</FieldLabel>
            <label class="flex items-center gap-1.5 text-body-sm text-muted-foreground">
              <Switch
                size="sm"
                :model-value="knobs[entry.key] === null"
                :data-test="`knob-${entry.key}-auto`"
                @update:model-value="(auto: boolean) => setAuto(entry.key, auto)"
              />
              Auto
            </label>
          </div>
          <InputNumber
            :model-value="knobs[entry.key] ?? knobs.base"
            :disabled="knobs[entry.key] === null"
            :min="0"
            :max="32"
            :step="1"
            size="sm"
            @update:model-value="(value: number) => setKnob(entry.key, value)"
          >
            <InputNumberDecrement />
            <InputNumberInput :aria-label="`${entry.label} radius in px`" />
            <InputNumberIncrement />
          </InputNumber>
        </Field>
      </div>

      <label class="flex w-fit items-center gap-2 text-body-sm">
        <Switch v-model="showRadii" data-test="show-radii" />
        Show radii
      </label>

      <div class="grid gap-4 md:grid-cols-2" :style="style" inert>
        <Card data-radius-target="card">
          <CardHeader><CardTitle>Card</CardTitle></CardHeader>
          <CardContent class="grid gap-4">
            <InputGroup>
              <InputGroupInput aria-label="Search" placeholder="Search" />
              <InputGroupAddon align="inline-end">
                <InputGroupButton data-radius-target="input-group-button">Go</InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <Tabs default-value="one">
              <TabsList data-radius-target="tabs-list">
                <TabsTrigger value="one" data-radius-target="tabs-trigger">One</TabsTrigger>
                <TabsTrigger value="two">Two</TabsTrigger>
              </TabsList>
            </Tabs>
            <div class="flex items-center gap-3">
              <Badge data-radius-target="badge">Badge</Badge>
              <Checkbox :model-value="true" aria-label="Checked" data-radius-target="checkbox" />
              <Kbd data-radius-target="kbd">⌘K</Kbd>
            </div>
          </CardContent>
        </Card>
        <div class="grid content-start gap-4">
          <div :class="cn(overlaySurface, 'animate-none', menuSizeVariants({ size: 'md' }))" data-radius-target="menu">
            <div :class="menuItem" data-highlighted data-radius-target="menu-item">Highlighted item</div>
            <div :class="menuItem">Item</div>
          </div>
          <div
            class="rounded-surface-lg border border-surface-border bg-dialog p-6 text-dialog-foreground shadow-shadow-dialog"
            data-radius-target="dialog"
          >
            Dialog
          </div>
        </div>
      </div>

      <div v-if="showRadii" class="grid gap-1 font-mono text-body-sm text-muted-foreground sm:grid-cols-2">
        <span v-for="(text, name) in labels" :key="name" :data-radius-label="name">{{ text }}</span>
      </div>

      <table class="w-full text-body-sm">
        <thead>
          <tr class="text-muted-foreground">
            <th class="text-start font-medium">Step</th>
            <th v-for="entry in roles" :key="entry.key" class="text-end font-medium">{{ entry.label }}</th>
          </tr>
        </thead>
        <tbody class="font-mono tabular-nums">
          <tr v-for="step in steps" :key="step">
            <td>{{ step }}</td>
            <td v-for="entry in roles" :key="entry.key" class="text-end">
              {{ hasStep(entry.key, step) ? formatPx(role(entry.key, step)) : '–' }}
            </td>
          </tr>
        </tbody>
      </table>

      <div class="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-end">
        <div class="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Outer radius, px</FieldLabel>
            <InputNumber v-model="outer" :min="0" :max="48" size="sm">
              <InputNumberDecrement />
              <InputNumberInput aria-label="Outer radius in px" />
              <InputNumberIncrement />
            </InputNumber>
          </Field>
          <Field>
            <FieldLabel>Inset, px</FieldLabel>
            <InputNumber v-model="inset" :min="0" :max="24" size="sm">
              <InputNumberDecrement />
              <InputNumberInput aria-label="Inset in px" />
              <InputNumberIncrement />
            </InputNumber>
          </Field>
        </div>
        <dl class="grid grid-cols-3 gap-2 text-body-sm">
          <div>
            <dt class="text-muted-foreground">R − inset</dt>
            <dd class="font-mono">{{ formatPx(Math.max(outer - inset, 0)) }}</dd>
          </div>
          <div :data-floor="floored ? '' : undefined" class="data-floor:text-primary">
            <dt class="text-muted-foreground">rounded-inset</dt>
            <dd class="font-mono">{{ formatPx(insetRadius(outer, inset)) }}</dd>
          </div>
          <div>
            <dt class="text-muted-foreground">rounded-outset</dt>
            <dd class="font-mono">{{ formatPx(outsetRadius(outer, inset)) }}</dd>
          </div>
        </dl>
      </div>
    </div>
  </DocsFigure>
</template>
