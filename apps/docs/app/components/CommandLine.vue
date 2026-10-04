<script setup lang="ts">
import CopyButton from '~/components/CopyButton.vue'
import ScrollBox from '~/components/ScrollBox.vue'

defineProps<{ command: string }>()
</script>

<template>
  <div class="flex items-center gap-2 rounded-lg border bg-card py-1.5 ps-4 pe-1.5">
    <div class="min-w-0 flex-1">
      <ScrollBox class="py-1.5">
        <code class="whitespace-nowrap font-mono text-sm">{{ command }}</code>
      </ScrollBox>
    </div>
    <CopyButton :value="command" />
  </div>
</template>
