<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <div
    data-slot="alert-dialog-header"
    :class="
      cn(
        `
          flex shrink-0 flex-col items-start gap-1.5 px-6
          group-data-[size=sm]/alert-dialog:items-center group-data-[size=sm]/alert-dialog:text-center
          group-data-[size=sm]/alert-dialog:text-balance
        `,
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
