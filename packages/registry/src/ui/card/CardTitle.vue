<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "@delta-ui/core/primitive";
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
    :class="cn('text-title-md group-data-[size=sm]/card:text-title-sm', props.class)"
  >
    <slot />
  </Primitive>
</template>
