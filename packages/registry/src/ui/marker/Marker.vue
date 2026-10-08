<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { type MarkerColor, type MarkerVariants, markerVariants } from ".";

interface Props extends PrimitiveProps {
  variant?: NonNullable<MarkerVariants["variant"]>;
  color?: MarkerColor | (string & {});
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<Props>(), {
  as: "div",
  variant: "default",
});
</script>

<template>
  <Primitive
    data-slot="marker"
    :data-variant="props.variant"
    :data-color="props.color"
    :as="as"
    :as-child="asChild"
    :class="cn(markerVariants({ variant: props.variant }), props.class)"
  >
    <slot />
  </Primitive>
</template>
