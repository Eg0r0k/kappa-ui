<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <span
    data-slot="marker-content"
    :class="
      cn(
        `
          min-w-0 wrap-break-word
          [&>a]:underline [&>a]:underline-offset-3
          [&>a:hover]:text-(--marker-hover)
          group-data-[variant=separator]/marker:flex-none group-data-[variant=separator]/marker:text-center
        `,
        props.class,
      )
    "
  >
    <slot />
  </span>
</template>
