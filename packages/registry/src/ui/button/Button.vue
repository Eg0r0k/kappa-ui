<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "@delta-ui/core/primitive";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { type ButtonVariants, buttonVariants } from ".";

interface Props extends PrimitiveProps {
  variant?: ButtonVariants["variant"];
  color?: ButtonVariants["color"];
  size?: ButtonVariants["size"];
  touchTarget?: ButtonVariants["touchTarget"];
  /** `inward` draws the focus ring inside, for hosts that clip overflow. */
  focusRing?: ButtonVariants["focusRing"];
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<Props>(), {
  as: "button",
});
</script>

<template>
  <Primitive
    data-slot="button"
    :data-variant="props.variant"
    :data-color="props.color"
    :data-size="props.size"
    :as="as"
    :as-child="asChild"
    :class="
      cn(
        buttonVariants({
          variant: props.variant,
          color: props.color,
          size: props.size,
          touchTarget: props.touchTarget,
          focusRing: props.focusRing,
        }),
        props.class,
      )
    "
  >
    <slot />
  </Primitive>
</template>
