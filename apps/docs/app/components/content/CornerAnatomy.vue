<script setup lang="ts">
import { computed, ref } from 'vue'

import { Slider } from '@/ui/slider'
import DocsFigure from '~/components/DocsFigure.vue'
import { formatPx, insetRadius, outsetRadius } from '~/lib/radius'

const scale = 4
const inset = 4
const radius = ref(8)

const inner = computed(() => insetRadius(radius.value, inset))
const outer = computed(() => outsetRadius(radius.value, inset))
const floored = computed(() => radius.value - inset < radius.value / 2)

type Side = 'insetInlineStart' | 'insetInlineEnd'

const circleAt = (centre: number, r: number, side: Side) => ({
  top: `${(centre - r) * scale}px`,
  [side]: `${(centre - r) * scale}px`,
  width: `${r * 2 * scale}px`,
  height: `${r * 2 * scale}px`,
})

const dotAt = (centre: number, side: Side) => ({
  top: `${centre * scale - 2}px`,
  [side]: `${centre * scale - 2}px`,
})

const circleClass = 'pointer-events-none absolute rounded-full border border-dashed'
const dotClass = 'pointer-events-none absolute size-1 rounded-full'
const legendClass = 'flex flex-wrap justify-center gap-x-4 gap-y-1 font-mono text-xs'
const legendItemClass = 'flex items-center gap-1.5'
</script>

<template>
  <DocsFigure title="Corners that never line up?">
    <template #actions>
      <div class="me-2 flex items-center gap-3">
        <Slider
          v-model="radius"
          :min="0"
          :max="16"
          :step="1"
          size="sm"
          class="w-20 sm:w-40"
          aria-label="Radius in px"
        />
        <span data-test="corner-radius-value" class="w-7 text-end font-mono text-xs text-muted-foreground tabular-nums">
          {{ formatPx(radius) }}
        </span>
      </div>
    </template>
    <div class="grid gap-8 px-6 py-10 sm:grid-cols-2" :style="{ '--r': `${radius * scale}px` }" aria-hidden="true">
      <div class="grid justify-items-center gap-3">
        <span class="font-mono text-xs text-muted-foreground">rounded-inset: a button in a frame</span>
        <div data-corner="frame" class="relative h-36 w-48 rounded-(--r) bg-background inset-ring inset-ring-border">
          <span data-corner="inset" class="absolute end-4 top-4 size-28 rounded-inset-(--r)/4 bg-primary/15" />
          <span
            data-corner-circle="frame"
            :class="[circleClass, 'border-primary']"
            :style="circleAt(radius, radius, 'insetInlineEnd')"
          />
          <span
            data-corner-circle="inset"
            :class="[circleClass, 'border-info']"
            :style="circleAt(inset + inner, inner, 'insetInlineEnd')"
          />
          <span :class="[dotClass, 'bg-primary']" :style="dotAt(radius, 'insetInlineEnd')" />
          <span :class="[dotClass, 'bg-info']" :style="dotAt(inset + inner, 'insetInlineEnd')" />
        </div>
        <ul :class="legendClass">
          <li :class="legendItemClass">
            <span class="size-2 rounded-full bg-primary" />
            R
            <span class="text-muted-foreground">{{ formatPx(radius) }}</span>
          </li>
          <li :class="legendItemClass">
            inset
            <span class="text-muted-foreground">{{ formatPx(inset) }}</span>
          </li>
          <li :class="legendItemClass">
            <span class="size-2 rounded-full bg-info" />
            rounded-inset
            <span class="text-muted-foreground">{{ formatPx(inner) }}</span>
            <span v-if="floored" data-corner-floor class="text-primary">floor R / 2</span>
          </li>
        </ul>
      </div>
      <div class="grid justify-items-center gap-3">
        <span class="font-mono text-xs text-muted-foreground">rounded-outset: a panel around an item</span>
        <div
          data-corner="panel"
          class="relative h-44 w-48 rounded-outset-(--r)/4 bg-popover p-4 inset-ring inset-ring-border"
        >
          <span data-corner="item" class="block h-36 rounded-(--r) bg-primary/15" />
          <span
            data-corner-circle="panel"
            :class="[circleClass, 'border-info']"
            :style="circleAt(outer, outer, 'insetInlineStart')"
          />
          <span
            data-corner-circle="item"
            :class="[circleClass, 'border-primary']"
            :style="circleAt(inset + radius, radius, 'insetInlineStart')"
          />
          <span :class="[dotClass, 'bg-info']" :style="dotAt(outer, 'insetInlineStart')" />
          <span :class="[dotClass, 'bg-primary']" :style="dotAt(inset + radius, 'insetInlineStart')" />
        </div>
        <ul :class="legendClass">
          <li :class="legendItemClass">
            <span class="size-2 rounded-full bg-primary" />
            r
            <span class="text-muted-foreground">{{ formatPx(radius) }}</span>
          </li>
          <li :class="legendItemClass">
            padding
            <span class="text-muted-foreground">{{ formatPx(inset) }}</span>
          </li>
          <li :class="legendItemClass">
            <span class="size-2 rounded-full bg-info" />
            rounded-outset
            <span class="text-muted-foreground">{{ formatPx(outer) }}</span>
          </li>
        </ul>
      </div>
    </div>
  </DocsFigure>
</template>
