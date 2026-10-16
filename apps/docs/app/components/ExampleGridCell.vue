<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'

import ComponentPreview from '~/components/content/ComponentPreview.vue'

const props = defineProps<{ name: string }>()

const cell = ref<HTMLElement>()
const near = ref(false)
const { stop } = useIntersectionObserver(
  cell,
  ([entry]) => {
    if (!entry?.isIntersecting) return
    near.value = true
    stop()
  },
  { rootMargin: '400px' },
)
</script>

<template>
  <div ref="cell" data-slot="example-grid-cell" class="min-h-96">
    <ComponentPreview v-if="near" :name="props.name" />
    <div v-else class="h-96 rounded-surface-md border bg-muted/40" />
  </div>
</template>
