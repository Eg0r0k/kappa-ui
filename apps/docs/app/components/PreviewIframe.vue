<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { Skeleton } from '@/ui/skeleton'
import {
  type ColorScheme,
  type Direction,
  type PreviewState,
  isPreviewEvent,
  previewPath,
} from '~/lib/preview-protocol'

const props = withDefaults(
  defineProps<{
    name: string
    colorScheme: ColorScheme
    dir: Direction
    siteTheme: string
    restart?: number
    minHeight?: number
    src?: string
    title?: string
  }>(),
  { restart: 0, minHeight: 288, src: undefined, title: undefined },
)
const emit = defineEmits<{ ready: []; error: [message: string]; shortcut: [] }>()

const frame = ref<HTMLIFrameElement>()
const ready = ref(false)
const reported = ref(0)

const state = computed<PreviewState>(() => ({
  type: 'kappa:state',
  colorScheme: props.colorScheme,
  dir: props.dir,
  restart: props.restart,
  siteTheme: props.siteTheme,
}))

const send = () => {
  if (ready.value) frame.value?.contentWindow?.postMessage({ ...state.value }, window.location.origin)
}

watch(state, send)

const onMessage = (event: MessageEvent) => {
  if (event.origin !== window.location.origin || event.source !== frame.value?.contentWindow) return
  if (!isPreviewEvent(event.data)) return
  const data = event.data
  if (data.type === 'kappa:ready') {
    ready.value = true
    send()
    emit('ready')
    return
  }
  if (data.type === 'kappa:size') reported.value = data.height
  if (data.type === 'kappa:error') emit('error', data.message)
  if (data.type === 'kappa:shortcut') emit('shortcut')
}

onMounted(() => window.addEventListener('message', onMessage))
onBeforeUnmount(() => window.removeEventListener('message', onMessage))

const height = computed(() => `${Math.max(props.minHeight, reported.value)}px`)
</script>

<template>
  <div data-slot="preview-iframe" class="relative">
    <Skeleton v-if="!ready" class="absolute inset-0 rounded-none" />
    <iframe
      ref="frame"
      :src="props.src ?? previewPath(props.name)"
      :title="props.title ?? props.name"
      loading="lazy"
      class="block w-full border-0"
      :style="{ height }"
    />
  </div>
</template>
