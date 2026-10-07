<script setup lang="ts">
import { thumbnailOf } from '~/lib/thumbnails'

const props = defineProps<{ path: string }>()

const svg = computed(() => thumbnailOf(props.path))
</script>

<template>
  <div
    v-if="svg"
    data-slot="component-thumbnail"
    aria-hidden="true"
    class="mx-1 -mt-3 overflow-hidden rounded-[max(0px,calc(var(--radius-lg)-var(--spacing)))] bg-muted/50 [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
    v-html="svg"
  />
</template>
