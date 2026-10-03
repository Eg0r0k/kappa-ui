<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <div
    data-slot="listbox-description"
    :class="
      cn(
        `
          text-body-sm text-muted-foreground
          group-data-disabled/listbox-item:text-foreground/(--disabled-opacity)
          group-data-disabled/listbox:text-foreground/(--disabled-opacity)
        `,
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
