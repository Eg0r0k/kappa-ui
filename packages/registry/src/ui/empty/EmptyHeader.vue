<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <div
    data-slot="empty-header"
    :class="
      cn(
        `
          flex max-w-sm flex-col items-center gap-2 text-center
          group-data-[size=xs]/empty:gap-1.5
          group-data-[size=sm]/empty:gap-1.5
          group-data-[size=lg]/empty:gap-3
          group-data-[size=xl]/empty:gap-3
        `,
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
