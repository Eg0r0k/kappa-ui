<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { cn } from '@/lib/utils'

const props = defineProps<{
  theme?: 'light' | 'dark'
  dir: 'ltr' | 'rtl'
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div
    :dir="props.dir"
    :class="
      cn(
        'flex min-h-72 items-center justify-center rounded-lg border bg-background p-10 text-foreground',
        props.theme,
        props.class,
      )
    "
  >
    <div :key="props.dir" class="flex w-full justify-center">
      <slot />
    </div>
  </div>
</template>
