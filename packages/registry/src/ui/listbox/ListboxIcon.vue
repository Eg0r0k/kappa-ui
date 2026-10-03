<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <span
    data-slot="listbox-icon"
    aria-hidden="true"
    :class="
      cn(
        `
          flex shrink-0 items-center justify-center text-muted-foreground
          group-data-[state=checked]/listbox-item:text-primary
          group-data-disabled/listbox-item:text-foreground/(--disabled-opacity)
          group-data-disabled/listbox:text-foreground/(--disabled-opacity)
        `,
        props.class,
      )
    "
  >
    <slot />
  </span>
</template>
