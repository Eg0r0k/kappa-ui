<script setup lang="ts">
import TitlePlaque from '~/components/home/canvas/TitlePlaque.vue'

defineProps<{ count: string }>()
</script>

<template>
  <div data-slot="canvas-fallback" class="flex size-full items-center justify-center">
    <div class="h-40 w-115 max-w-full">
      <TitlePlaque :count="count" />
    </div>
  </div>
</template>
