<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import {
  type ColorScheme,
  type Direction,
  type PreviewState,
  type Tone,
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
    color?: Tone
    inspect?: boolean
    minHeight?: number
    height?: string
    src?: string
    title?: string
  }>(),
  { restart: 0, color: 'primary', inspect: false, minHeight: 288, height: undefined, src: undefined, title: undefined },
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
  color: props.color,
  inspect: props.inspect,
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

const onLoad = () => {
  const content = frame.value?.contentDocument?.querySelector<HTMLElement>('[data-slot=preview-content]')
  const canvas = content?.parentElement
  if (!content || !canvas || reported.value) return
  const style = getComputedStyle(canvas)
  reported.value = Math.ceil(
    content.offsetHeight + Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom),
  )
}

const height = computed(() => props.height ?? `${Math.max(props.minHeight, reported.value)}px`)
</script>

<template>
  <div data-slot="preview-iframe" class="relative">
    <iframe
      ref="frame"
      :src="props.src ?? previewPath(props.name)"
      :title="props.title ?? props.name"
      loading="lazy"
      class="block w-full border-0"
      :style="{ height, colorScheme: props.colorScheme }"
      @load="onLoad"
    />
  </div>
</template>
