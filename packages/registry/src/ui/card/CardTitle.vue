<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";

interface Props extends PrimitiveProps {
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<Props>(), {
  as: "h3",
});
</script>

<template>
  <Primitive
    data-slot="card-title"
    :as="as"
    :as-child="asChild"
    :class="
      cn(
        'text-title-md group-data-[size=xs]/card:text-title-sm group-data-[size=sm]/card:text-title-sm group-data-[size=lg]/card:text-title-lg group-data-[size=xl]/card:text-headline-sm',
        props.class,
      )
    "
  >
    <slot />
  </Primitive>
</template>
