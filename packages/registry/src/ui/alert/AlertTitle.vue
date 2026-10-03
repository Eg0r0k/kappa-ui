<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <div
    data-slot="alert-title"
    :class="
      cn(
        `
          col-start-2 min-w-0 text-title-sm
          group-data-[orientation=horizontal]/alert:row-start-2
          group-data-[size=xs]/alert:text-label-md
          group-data-[size=lg]/alert:text-title-md
          group-data-[size=xl]/alert:text-title-lg group-data-[size=xl]/alert:font-medium
        `,
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
