<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'
import { defineAsyncComponent, shallowRef, useTemplateRef } from 'vue'

import CanvasFallback from '~/components/home/canvas/CanvasFallback.vue'
import components from '~/assets/canvas/components.json'

// The canvas is its own chunk, fetched once the section comes within 600px of the viewport.
const CanvasStage = defineAsyncComponent(() => import('~/components/home/canvas/CanvasStage.vue'))

const count = `${components.length} components`
const section = useTemplateRef<HTMLElement>('section')
const near = shallowRef(false)
const { stop } = useIntersectionObserver(
  section,
  (entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return
    near.value = true
    stop()
  },
  { rootMargin: '600px' },
)
</script>

<template>
  <section
    ref="section"
    data-slot="home-canvas"
    aria-label="Component canvas"
    class="relative overflow-hidden text-foreground max-lg:h-[min(70svh,36rem)]"
  >
    <ClientOnly>
      <CanvasStage v-if="near" />
      <CanvasFallback v-else :count="count" />
      <template #fallback>
        <CanvasFallback :count="count" />
      </template>
    </ClientOnly>
  </section>
</template>
