<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <div
    data-slot="item-title"
    :class="
      cn(
        `
          flex w-fit items-center gap-2 text-label-lg
          group-data-[size=xs]/item:text-label-md
          group-data-[size=lg]/item:text-title-md
          group-data-[size=xl]/item:text-title-md
        `,
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
