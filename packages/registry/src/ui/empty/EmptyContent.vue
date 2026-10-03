<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <div
    data-slot="empty-content"
    :class="
      cn(
        `
          flex w-full min-w-0 max-w-sm flex-col items-center gap-4 text-balance
          group-data-[size=xs]/empty:gap-3
          group-data-[size=sm]/empty:gap-3
          group-data-[size=lg]/empty:gap-5
          group-data-[size=xl]/empty:gap-5
        `,
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
