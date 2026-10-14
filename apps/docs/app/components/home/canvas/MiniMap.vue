<script setup lang="ts">
import { Map as MapIcon, Minimize2 } from '@lucide/vue'
import { computed, shallowRef, useTemplateRef, watch } from 'vue'

import { Button } from '@/ui/button'
import { PLAQUE } from '~/lib/canvas'
import type { Packing } from '~/lib/canvas-layout'

const props = defineProps<{ tile: Packing; openId: string | null; size: number }>()
const emit = defineEmits<{ jump: [x: number, y: number] }>()

const width = computed(() =>
  props.tile.width >= props.tile.height ? props.size : Math.round((props.size * props.tile.width) / props.tile.height),
)
const height = computed(() =>
  props.tile.width >= props.tile.height ? Math.round((props.size * props.tile.height) / props.tile.width) : props.size,
)
const frames = useTemplateRef<SVGRectElement[]>('frames')

const KEY = 'kappa-canvas:map-collapsed'
const read = () => {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}
const collapsed = shallowRef(read())
watch(collapsed, (value) => {
  try {
    localStorage.setItem(KEY, value ? '1' : '0')
  } catch {
    // Storage blocked: the map still folds, it just won't remember.
  }
})

const BUTTON = 40
const PAD = 12
const box = computed(() =>
  collapsed.value
    ? { width: `${BUTTON}px`, height: `${BUTTON}px` }
    : { width: `${width.value + PAD}px`, height: `${height.value + PAD}px` },
)

// Four copies of the viewport frame: on a torus the frame can wrap across the map's edges.
const copies = [
  [0, 0],
  [-1, 0],
  [0, -1],
  [-1, -1],
] as const

/** Called by the canvas after it paints. */
const update = (x: number, y: number, w: number, h: number) => {
  const W = props.tile.width
  const H = props.tile.height
  const left = (((x - w / 2) % W) + W) % W
  const top = (((y - h / 2) % H) + H) % H
  frames.value?.forEach((rect, i) => {
    const [cx, cy] = copies[i]!
    rect.setAttribute('x', String(left + cx * W))
    rect.setAttribute('y', String(top + cy * H))
    rect.setAttribute('width', String(w))
    rect.setAttribute('height', String(h))
  })
}

let dragging = false
const point = (event: PointerEvent) => {
  const bounds = (event.currentTarget as Element).getBoundingClientRect()
  emit(
    'jump',
    ((event.clientX - bounds.left) / bounds.width) * props.tile.width,
    ((event.clientY - bounds.top) / bounds.height) * props.tile.height,
  )
}
const onDown = (event: PointerEvent) => {
  event.stopPropagation()
  dragging = true
  ;(event.currentTarget as Element).setPointerCapture(event.pointerId)
  point(event)
}
const onMove = (event: PointerEvent) => {
  event.stopPropagation()
  if (dragging) point(event)
}
const onUp = (event: PointerEvent) => {
  event.stopPropagation()
  dragging = false
}

const fill = (id: string) => {
  if (id === props.openId) return 'fill-primary'
  return id === PLAQUE.id ? 'fill-primary/40' : 'fill-muted-foreground/35'
}

defineExpose({ update })
</script>

<template>
  <div
    data-slot="canvas-map"
    class="overflow-hidden bg-card shadow-shadow-md ring-1 ring-border transition-[width,height,border-radius] duration-medium-4 ease-emphasized-decelerate motion-reduce:transition-none"
    :class="collapsed ? 'rounded-[20px]' : 'rounded-surface-sm'"
    :style="box"
  >
    <div
      class="relative p-1.5 transition-opacity motion-reduce:transition-none"
      :class="collapsed ? 'pointer-events-none opacity-0 duration-short-2' : 'opacity-100 delay-150 duration-short-4'"
      :inert="collapsed"
    >
      <svg
        :viewBox="`0 0 ${tile.width} ${tile.height}`"
        :width="width"
        :height="height"
        preserveAspectRatio="none"
        aria-hidden="true"
        class="block cursor-crosshair touch-none overflow-hidden rounded-inset-surface-sm/1.5"
        @pointerdown="onDown"
        @pointermove="onMove"
        @pointerup="onUp"
        @pointercancel="onUp"
      >
        <rect :width="tile.width" :height="tile.height" class="fill-muted" />
        <rect
          v-for="item in tile.items"
          :key="item.id"
          :x="item.x - item.width / 2"
          :y="item.y - item.height / 2"
          :width="item.width"
          :height="item.height"
          :rx="24"
          :class="fill(item.id)"
        />
        <rect
          v-for="(_, i) in copies"
          ref="frames"
          :key="i"
          class="fill-primary/10 stroke-primary"
          stroke-width="2"
          vector-effect="non-scaling-stroke"
          rx="16"
        />
      </svg>
      <Button
        variant="subtle"
        color="neutral"
        size="icon-xs"
        class="absolute end-2.5 top-2.5"
        aria-label="Collapse map"
        aria-expanded="true"
        @pointerdown.stop
        @click.stop="collapsed = true"
      >
        <Minimize2 />
      </Button>
    </div>

    <Button
      v-if="collapsed"
      variant="ghost"
      color="neutral"
      size="icon-lg"
      class="absolute inset-0 m-auto rounded-full"
      aria-label="Show map"
      aria-expanded="false"
      @pointerdown.stop
      @click.stop="collapsed = false"
    >
      <MapIcon />
    </Button>
  </div>
</template>
