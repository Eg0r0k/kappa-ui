<script setup lang="ts">
import { ref } from 'vue'

import { DEMO_WIDTH, clampWidth } from '~/lib/demo'

const width = defineModel<number>({ required: true })
const emit = defineEmits<{ commit: []; resizing: [active: boolean] }>()

const dragging = ref(false)
let start = { x: 0, width: 0 }

const set = (value: number) => {
  width.value = clampWidth(value)
}

const keys: Record<string, (value: number) => number> = {
  ArrowLeft: (value) => value + DEMO_WIDTH.step,
  ArrowRight: (value) => value - DEMO_WIDTH.step,
  Home: () => DEMO_WIDTH.min,
  End: () => DEMO_WIDTH.max,
}

const onKeydown = (event: KeyboardEvent) => {
  const move = keys[event.key]
  if (!move) return
  event.preventDefault()
  set(move(width.value))
  emit('commit')
}

const reset = () => {
  set(DEMO_WIDTH.initial)
  emit('commit')
}

const onPointerdown = (event: PointerEvent) => {
  if (event.button !== 0) return
  event.preventDefault()
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  start = { x: event.clientX, width: width.value }
  dragging.value = true
  emit('resizing', true)
}

const onPointermove = (event: PointerEvent) => {
  if (dragging.value) set(start.width + start.x - event.clientX)
}

const onPointerup = () => {
  if (!dragging.value) return
  dragging.value = false
  emit('resizing', false)
  emit('commit')
}
</script>

<template>
  <div
    role="separator"
    tabindex="0"
    aria-orientation="vertical"
    aria-label="Resize the example panel"
    :aria-valuemin="DEMO_WIDTH.min"
    :aria-valuemax="DEMO_WIDTH.max"
    :aria-valuenow="width"
    :data-state="dragging ? 'drag' : undefined"
    data-slot="demo-width-handle"
    class="group/handle z-10 w-3 cursor-col-resize touch-none outline-none"
    @keydown="onKeydown"
    @dblclick="reset"
    @pointerdown="onPointerdown"
    @pointermove="onPointermove"
    @pointerup="onPointerup"
    @pointercancel="onPointerup"
  >
    <span
      class="absolute inset-0 mx-auto w-px transition-colors duration-short-4 ease-standard group-hover/handle:bg-primary group-focus-visible/handle:bg-primary group-data-[state=drag]/handle:bg-primary motion-reduce:transition-none"
    />
  </div>
</template>
