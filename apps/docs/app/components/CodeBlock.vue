<script setup lang="ts">
import CopyButton from '~/components/CopyButton.vue'
import ScrollBox from '~/components/ScrollBox.vue'

defineProps<{ filename?: string; html: string; source: string }>()
</script>

<template>
  <div class="relative overflow-hidden rounded-lg border bg-muted/40">
    <div v-if="filename" class="flex h-11 items-center border-b ps-4 pe-12 font-mono text-xs text-muted-foreground">
      {{ filename }}
    </div>
    <CopyButton :value="source" class="absolute end-1.5 top-1.5 z-10" />
    <ScrollBox :max-height="512" class="p-4 text-sm leading-6">
      <div v-html="html" />
    </ScrollBox>
  </div>
</template>
