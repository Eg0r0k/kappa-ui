<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <span
    data-slot="tree-item-icon"
    aria-hidden="true"
    :class="
      cn(
        `
          flex shrink-0 items-center justify-center text-muted-foreground
          group-data-selected/tree-item:text-primary
          group-data-disabled/tree-item:text-foreground/(--disabled-opacity)
        `,
        props.class,
      )
    "
  >
    <slot />
  </span>
</template>
