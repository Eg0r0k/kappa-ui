<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <p
    data-slot="item-description"
    :class="
      cn(
        `
          line-clamp-2 text-body-md text-balance text-muted-foreground
          group-data-[size=xs]/item:text-body-sm
          group-data-[size=sm]/item:text-body-sm
          group-data-[size=xl]/item:text-body-lg
          [&>a]:underline [&>a]:underline-offset-4
          [&>a:hover]:text-primary
        `,
        props.class,
      )
    "
  >
    <slot />
  </p>
</template>
