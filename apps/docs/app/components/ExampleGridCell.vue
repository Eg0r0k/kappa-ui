<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'

import ComponentPreview from '~/components/content/ComponentPreview.vue'
import { exampleSlug, pageSlugOf } from '~/lib/examples'

const props = defineProps<{ name: string; eager?: boolean }>()

const slug = exampleSlug(props.name, pageSlugOf(useRoute().path))
const cell = ref<HTMLElement>()
const near = ref(props.eager)
if (!props.eager) {
  const { stop } = useIntersectionObserver(
    cell,
    ([entry]) => {
      if (!entry?.isIntersecting) return
      near.value = true
      stop()
    },
    { rootMargin: '400px' },
  )
}
</script>

<template>
  <div ref="cell" data-slot="example-grid-cell" class="min-h-96">
    <ComponentPreview v-if="near" :name="props.name" compact />
    <div
      v-else
      :data-example="slug"
      class="h-96 scroll-mt-20 rounded-surface-md border bg-muted/40 max-md:scroll-mt-30"
    />
  </div>
</template>
