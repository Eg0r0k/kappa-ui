<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

interface Props extends PrimitiveProps {
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<Props>(), { as: "h3" });
</script>

<template>
  <Primitive
    data-slot="empty-title"
    :as="props.as"
    :as-child="props.asChild"
    :class="
      cn(
        `
          text-title-md
          group-data-[size=xs]/empty:text-label-lg
          group-data-[size=sm]/empty:text-title-sm
          group-data-[size=lg]/empty:text-title-lg
          group-data-[size=xl]/empty:text-headline-sm
        `,
        props.class,
      )
    "
  >
    <slot />
  </Primitive>
</template>
