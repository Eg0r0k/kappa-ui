<script setup lang="ts">
import { computed, ref } from 'vue'

import { Slider } from '@/ui/slider'
import DocsFigure from '~/components/DocsFigure.vue'
import { formatPx, insetRadius } from '~/lib/radius'

const scale = 4
const inset = 4
const radius = ref(8)

const inner = computed(() => insetRadius(radius.value, inset))
const floored = computed(() => radius.value - inset < radius.value / 2)

const circleAt = (centre: number, r: number) => ({
  top: `${(centre - r) * scale}px`,
  insetInlineEnd: `${(centre - r) * scale}px`,
  width: `${r * 2 * scale}px`,
  height: `${r * 2 * scale}px`,
})

const dotAt = (centre: number) => ({
  top: `${centre * scale - 2}px`,
  insetInlineEnd: `${centre * scale - 2}px`,
})

const circleClass = 'pointer-events-none absolute rounded-full border border-dashed'
const dotClass = 'pointer-events-none absolute size-1 rounded-full'
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
    <div
      class="grid justify-items-center gap-5 px-6 py-10"
      :style="{ '--r': `${radius * scale}px` }"
      aria-hidden="true"
    >
      <div data-corner="frame" class="relative h-36 w-56 rounded-(--r) bg-background inset-ring inset-ring-border">
        <span data-corner="inset" class="absolute end-4 top-4 size-28 rounded-inset-(--r)/4 bg-primary/15" />
        <span data-corner-circle="frame" :class="[circleClass, 'border-primary']" :style="circleAt(radius, radius)" />
        <span
          data-corner-circle="inset"
          :class="[circleClass, 'border-warning']"
          :style="circleAt(inset + inner, inner)"
        />
        <span :class="[dotClass, 'bg-primary']" :style="dotAt(radius)" />
        <span :class="[dotClass, 'bg-warning']" :style="dotAt(inset + inner)" />
      </div>
      <ul class="flex flex-wrap justify-center gap-x-5 gap-y-1 font-mono text-xs">
        <li class="flex items-center gap-1.5">
          <span class="size-2 rounded-full bg-primary" />
          frame
          <span class="text-muted-foreground">{{ formatPx(radius) }}</span>
        </li>
        <li class="flex items-center gap-1.5">
          <span class="size-2 rounded-full bg-warning" />
          button
          <span class="text-muted-foreground">{{ formatPx(inner) }}</span>
          <span v-if="floored" data-corner-floor class="text-warning-text">floor R / 2</span>
          <span v-else class="text-muted-foreground">R − 4px</span>
        </li>
      </ul>
    </div>
  </DocsFigure>
</template>
