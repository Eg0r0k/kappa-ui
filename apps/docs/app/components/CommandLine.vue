<script setup lang="ts">
import CopyButton from '~/components/CopyButton.vue'

defineProps<{ command: string }>()
</script>

<template>
  <div class="flex items-center gap-2 rounded-lg border bg-muted/40 py-1.5 ps-4 pe-1.5">
    <code class="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-sm">{{ command }}</code>
    <CopyButton :value="command" />
  </div>
</template>
