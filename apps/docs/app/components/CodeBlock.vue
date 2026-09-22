<script setup lang="ts">
import CopyButton from '~/components/CopyButton.vue'

defineProps<{ filename?: string; html: string; source: string }>()
</script>

<template>
  <div class="relative overflow-hidden rounded-lg border bg-muted/40">
    <div v-if="filename" class="border-b px-4 py-2 pe-12 font-mono text-xs text-muted-foreground">
      {{ filename }}
    </div>
    <CopyButton :value="source" class="absolute end-1.5 top-1.5" />
    <div class="max-h-[32rem] overflow-auto p-4 text-sm leading-6" v-html="html" />
  </div>
</template>
