<script setup lang="ts">
import { useIntersectionObserver, useResizeObserver } from '@vueuse/core'
import { computed, ref, useTemplateRef } from 'vue'

import { Skeleton } from '@/ui/skeleton'
import PreviewIframe from '~/components/PreviewIframe.vue'
import type { ColorScheme, Direction, Tone } from '~/lib/preview-protocol'

const props = withDefaults(
  defineProps<{
    name: string
    colorScheme: ColorScheme
    dir: Direction
    siteTheme: string
    restart?: number
    color?: Tone
    inspect?: boolean
    minHeight?: number
    height?: string
    src?: string
    title?: string
    rootMargin?: string
  }>(),
  {
    restart: 0,
    color: 'primary',
    inspect: false,
    minHeight: 288,
    height: undefined,
    src: undefined,
    title: undefined,
    rootMargin: '600px',
  },
)
const emit = defineEmits<{ ready: []; error: [message: string]; shortcut: [] }>()

const root = useTemplateRef<HTMLElement>('root')
const near = ref(false)
const measured = ref<number>()

useIntersectionObserver(
  root,
  (entries) => {
    near.value = entries.some((entry) => entry.isIntersecting)
  },
  { rootMargin: props.rootMargin },
)

useResizeObserver(root, () => {
  if (near.value && root.value) measured.value = root.value.offsetHeight
})

const frame = computed(() => {
  const { rootMargin: _, ...rest } = props
  return rest
})
const placeholder = computed(() => props.height ?? `${measured.value ?? props.minHeight}px`)
</script>

<template>
  <div ref="root" data-slot="lazy-preview" class="relative" :style="near ? undefined : { minHeight: placeholder }">
    <PreviewIframe
      v-if="near"
      v-bind="frame"
      class="h-full"
      @ready="emit('ready')"
      @error="(message) => emit('error', message)"
      @shortcut="emit('shortcut')"
    />
    <Skeleton v-else class="absolute inset-0 rounded-none" />
  </div>
</template>
