<script setup lang="ts">
import { type HTMLAttributes, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'

import { cn } from '@/lib/utils'
import { ScrollArea } from '@/ui/scroll-area'

const props = defineProps<{
  maxHeight?: number
  class?: HTMLAttributes['class']
}>()

const inner = useTemplateRef<HTMLElement>('inner')
const height = ref(0)
const ready = ref(false)

let observer: ResizeObserver | undefined

const observe = () => {
  observer?.disconnect()
  observer = new ResizeObserver(() => {
    if (inner.value) height.value = inner.value.offsetHeight
  })
  if (inner.value) observer.observe(inner.value)
}

onMounted(async () => {
  height.value = inner.value?.offsetHeight ?? 0
  ready.value = true
  await nextTick()
  observe()
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div
    v-if="!ready"
    data-slot="scroll-box"
    :class="props.maxHeight ? 'overflow-auto' : 'overflow-x-auto'"
    :style="props.maxHeight ? { maxHeight: `${props.maxHeight}px` } : undefined"
  >
    <div ref="inner" :class="cn('min-w-full', props.class)">
      <slot />
    </div>
  </div>
  <ScrollArea v-else-if="props.maxHeight" data-slot="scroll-box" :style="{ height: `${Math.min(height, props.maxHeight)}px` }">
    <ScrollArea orientation="horizontal" :style="{ height: `${height}px` }">
      <div ref="inner" :class="cn('min-w-full', props.class)">
        <slot />
      </div>
    </ScrollArea>
  </ScrollArea>
  <ScrollArea v-else data-slot="scroll-box" orientation="horizontal" :style="{ height: `${height}px` }">
    <div ref="inner" :class="cn('min-w-full', props.class)">
      <slot />
    </div>
  </ScrollArea>
</template>
