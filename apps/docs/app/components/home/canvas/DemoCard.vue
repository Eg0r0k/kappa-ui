<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'
import { type Component, shallowRef, useTemplateRef } from 'vue'

import ExampleBoundary from '~/components/ExampleBoundary.vue'

const props = defineProps<{
  title: string
  component: Component
  /** The demo's box, measured at build time with every inline section open. */
  width: number
  height: number
  open?: boolean
  /** False for a card that just scrolled in: its demo mounts a moment later, off the busy frame. */
  live?: boolean
  /** The catalogue's SVG sketch, shown until the demo mounts. */
  thumbnail?: string
}>()

// The box keeps its build-time size, so the layout never shifts. A live demo that still comes out
// bigger (a month with six weeks, a font that loaded late) is scaled to fit instead of being cut off.
const content = useTemplateRef<HTMLElement>('content')
const fit = shallowRef(1)
useResizeObserver(content, () => {
  const el = content.value
  if (!el) return
  const spill = el.scrollWidth - props.width
  const wide = spill > 16 ? props.width + 2 * spill : props.width
  fit.value = Math.min(1, props.width / wide, props.height / Math.max(1, el.offsetHeight))
})
</script>

<template>
  <figure class="m-0 flex flex-col items-center gap-2">
    <div
      data-slot="demo-card"
      class="relative rounded-surface-lg bg-card p-6 text-card-foreground shadow-shadow-sm ring-1 ring-border transition-shadow duration-short-4 [contain:layout_paint]"
      :class="open && 'shadow-shadow-lg ring-2 ring-primary'"
    >
      <div
        data-slot="demo-body"
        class="relative"
        :style="{ width: `${width}px`, height: `${height}px` }"
        :inert="!open"
        :data-open-body="open || undefined"
      >
        <div
          ref="content"
          class="absolute top-0 left-1/2 flex origin-top justify-center"
          :style="{ width: `${width}px`, transform: `translateX(-50%) scale(${fit})` }"
        >
          <ExampleBoundary v-if="live">
            <component :is="component" />
          </ExampleBoundary>
          <div
            v-else
            aria-hidden="true"
            class="overflow-hidden rounded-surface-xs bg-muted/40 [&>svg]:size-full"
            :style="{ width: `${width}px`, height: `${height}px` }"
            v-html="thumbnail ?? ''"
          />
        </div>
      </div>
    </div>
    <figcaption class="text-label-md text-muted-foreground" :class="open && 'text-primary'">{{ title }}</figcaption>
  </figure>
</template>
