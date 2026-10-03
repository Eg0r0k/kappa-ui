<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <p
    data-slot="card-description"
    :class="
      cn(
        `
          text-body-md text-muted-foreground
          group-data-[size=xs]/card:text-body-sm
          group-data-[size=sm]/card:text-body-sm
          group-data-[size=xl]/card:text-body-lg
        `,
        props.class,
      )
    "
  >
    <slot />
  </p>
</template>
