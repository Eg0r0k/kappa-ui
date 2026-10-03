<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <p
    data-slot="empty-description"
    :class="
      cn(
        `
          text-body-md text-balance text-muted-foreground
          group-data-[size=xs]/empty:text-body-sm
          group-data-[size=sm]/empty:text-body-sm
          group-data-[size=xl]/empty:text-body-lg
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
