<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

const props = defineProps<{ title?: string; class?: HTMLAttributes['class'] }>()
</script>

<template>
  <div data-slot="table-frame" :class="cn('not-prose rounded-surface-md border bg-muted/40 p-1', props.class)">
    <div v-if="props.title" class="mb-1 flex h-9 items-center ps-2.5 text-body-sm text-muted-foreground">
      {{ props.title }}
    </div>
    <div class="overflow-hidden rounded-inset-surface-md/1 bg-card">
      <slot />
    </div>
  </div>
</template>
