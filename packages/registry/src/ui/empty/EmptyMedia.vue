<script setup lang="ts">
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

const props = defineProps<{ class?: HTMLAttributes["class"] }>();
</script>

<template>
  <div
    data-slot="empty-media"
    :class="
      cn(
        `
          flex shrink-0 items-center justify-center text-muted-foreground
          [&_svg]:pointer-events-none [&_svg]:shrink-0
          [&>svg:not([class*=size-])]:size-10
          group-data-[size=xs]/empty:[&>svg:not([class*=size-])]:size-6
          group-data-[size=sm]/empty:[&>svg:not([class*=size-])]:size-8
          group-data-[size=lg]/empty:[&>svg:not([class*=size-])]:size-12
          group-data-[size=xl]/empty:[&>svg:not([class*=size-])]:size-14
        `,
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
