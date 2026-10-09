<script setup lang="ts">
import { computed, ref } from 'vue'

import { Button } from '@/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/ui/card'
import { Field, FieldLabel } from '@/ui/field'
import { menuItem, menuSizeVariants } from '@/ui/menu'
import { Slider } from '@/ui/slider'
import { cn } from '@/lib/utils'
import DocsFigure from '~/components/DocsFigure.vue'
import { type RadiusRole, formatPx, stepRadius } from '~/lib/radius'

const roles = [
  { key: 'control', label: 'Control', target: 'button' },
  { key: 'surface', label: 'Surface', target: 'card' },
  { key: 'item', label: 'Item', target: 'item' },
] as const satisfies readonly { key: RadiusRole; label: string; target: string }[]

const knobs = ref<Record<RadiusRole, number>>({ control: 8, surface: 8, item: 8 })

const style = computed(() => ({
  '--control-radius': `${knobs.value.control}px`,
  '--surface-radius': `${knobs.value.surface}px`,
  '--item-radius': `${knobs.value.item}px`,
}))

const radiusOf = (role: RadiusRole) => stepRadius(knobs.value[role], role, 'md')

const circle = (role: RadiusRole) => ({ width: `${radiusOf(role) * 2}px`, height: `${radiusOf(role) * 2}px` })
</script>

<template>
  <DocsFigure title="Three roles, three knobs">
    <div
      class="grid gap-x-6 gap-y-5 p-6 sm:grid-flow-col sm:grid-cols-3 sm:grid-rows-[auto_auto_auto] sm:p-8"
      :style="style"
    >
      <div v-for="role in roles" :key="role.key" :data-radius-role="role.key" class="contents">
        <Field class="gap-1.5">
          <div class="flex items-baseline justify-between gap-2">
            <FieldLabel>{{ role.label }}</FieldLabel>
            <span data-radius-value class="font-mono text-xs text-muted-foreground tabular-nums">
              {{ formatPx(knobs[role.key]) }}
            </span>
          </div>
          <Slider
            v-model="knobs[role.key]"
            :min="0"
            :max="16"
            :step="1"
            size="sm"
            :aria-label="`${role.label} radius in px`"
          />
        </Field>
        <div class="relative w-fit" inert>
          <Button v-if="role.key === 'control'" data-radius-target="button">Save</Button>
          <Card v-else-if="role.key === 'surface'" variant="subtle" class="w-44" data-radius-target="card">
            <CardHeader>
              <CardTitle>Card</CardTitle>
              <CardDescription>A surface</CardDescription>
            </CardHeader>
          </Card>
          <div v-else :class="cn(menuSizeVariants({ size: 'md' }), 'p-0')">
            <div :class="cn(menuItem, 'w-44')" data-highlighted data-radius-target="item">Highlighted item</div>
          </div>
          <span
            :data-radius-circle="role.target"
            class="pointer-events-none absolute start-0 top-0 rounded-full border border-dashed border-primary"
            :style="circle(role.key)"
          />
        </div>
        <span :data-radius-label="role.target" class="font-mono text-xs text-muted-foreground">
          {{ `rounded-${role.key}-md ${formatPx(radiusOf(role.key))}` }}
        </span>
      </div>
    </div>
  </DocsFigure>
</template>
