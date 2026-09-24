<script setup lang="ts">
import CopyButton from '~/components/CopyButton.vue'
import ScrollBox from '~/components/ScrollBox.vue'

const props = defineProps<{
  code?: string
  language?: string | null
  filename?: string | null
  highlights?: number[]
  meta?: string | null
  class?: string | null
  style?: string | Record<string, string> | null
}>()
</script>

<template>
  <div class="not-prose relative my-6 overflow-hidden rounded-lg border bg-muted/40">
    <div v-if="props.filename" class="flex h-11 items-center border-b ps-4 pe-12 font-mono text-xs text-muted-foreground">
      {{ props.filename }}
    </div>
    <CopyButton v-if="props.code" :value="props.code" class="absolute end-1.5 top-1.5 z-10" />
    <ScrollBox>
      <pre :class="['p-4 text-sm leading-6', props.class]" :style="props.style ?? undefined"><slot /></pre>
    </ScrollBox>
  </div>
</template>
