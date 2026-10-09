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
    class="mx-1 -mt-3 overflow-hidden rounded-inset-surface-sm/1 bg-[color-mix(in_oklab,var(--muted)_50%,var(--card))] [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
    v-html="svg"
  />
</template>
