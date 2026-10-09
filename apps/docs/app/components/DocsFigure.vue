<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

const props = defineProps<{ title: string; class?: HTMLAttributes['class'] }>()
</script>

<template>
  <figure data-slot="figure" class="not-prose my-6 rounded-surface-md border bg-muted/40 p-1">
    <div class="mb-1 flex h-9 items-center gap-2 ps-2.5 pe-0.5">
      <figcaption class="min-w-0 flex-1 truncate text-body-sm text-muted-foreground">{{ props.title }}</figcaption>
      <slot name="actions" />
    </div>
    <div :class="cn('overflow-hidden rounded-inset-surface-md/1 bg-card', props.class)">
      <slot />
    </div>
  </figure>
</template>
