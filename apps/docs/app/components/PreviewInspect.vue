<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'

type Box = { key: number; top: number; left: number; width: number; height: number; slot: string; detail: string }

const layer = useTemplateRef<HTMLElement>('layer')
const boxes = ref<Box[]>([])
const size = ref('')
let frame = 0

const own = (slot: string) => slot.startsWith('preview-') || slot.startsWith('inspect-')

const measure = () => {
  frame = 0
  size.value = `${window.innerWidth} × ${window.innerHeight}`
  boxes.value = [...document.body.querySelectorAll<HTMLElement>('[data-slot]')].flatMap((element, key) => {
    const slot = element.dataset.slot ?? ''
    if (own(slot) || !element.checkVisibility()) return []
    const rect = element.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return []
    const { variant, size, color } = element.dataset
    const detail = [variant, size, color].filter(Boolean).join(' · ')
    return [{ key, top: rect.top, left: rect.left, width: rect.width, height: rect.height, slot, detail }]
  })
}

const schedule = () => {
  if (!frame) frame = requestAnimationFrame(measure)
}

const mutations = new MutationObserver((records) => {
  if (records.some((record) => !layer.value?.contains(record.target))) schedule()
})
const resizes = new ResizeObserver(schedule)

onMounted(() => {
  measure()
  mutations.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true })
  resizes.observe(document.documentElement)
  const content = document.querySelector('[data-slot=preview-content]')
  if (content) resizes.observe(content)
  window.addEventListener('scroll', schedule, { capture: true, passive: true })
  window.addEventListener('resize', schedule)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  mutations.disconnect()
  resizes.disconnect()
  window.removeEventListener('scroll', schedule, { capture: true })
  window.removeEventListener('resize', schedule)
})
</script>

<template>
  <div ref="layer" data-slot="inspect-layer" aria-hidden="true" class="pointer-events-none fixed inset-0 z-2147483647">
    <div
      v-for="box in boxes"
      :key="box.key"
      class="absolute outline outline-info/70 outline-dashed"
      :style="{ top: `${box.top}px`, left: `${box.left}px`, width: `${box.width}px`, height: `${box.height}px` }"
    >
      <span
        class="absolute start-0 bottom-full flex max-w-full flex-col overflow-hidden bg-info px-1 font-mono text-[10px] leading-3.5 whitespace-nowrap text-info-foreground"
      >
        <span>{{ box.slot }}</span>
        <span v-if="box.detail" class="opacity-80">{{ box.detail }}</span>
      </span>
    </div>
    <span
      class="absolute end-2 bottom-2 rounded-sm bg-foreground/80 px-1.5 py-0.5 font-mono text-[11px] text-background tabular-nums"
    >
      {{ size }}
    </span>
  </div>
</template>
