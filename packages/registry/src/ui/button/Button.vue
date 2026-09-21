<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { type ButtonVariants, buttonVariants } from ".";

interface Props extends PrimitiveProps {
  variant?: ButtonVariants["variant"];
  size?: ButtonVariants["size"];
  touchTarget?: ButtonVariants["touchTarget"];
  /**
   * `inward` draws the focus ring inside the button instead of around it.
   * Use it when a parent clips overflow, where an outward ring would be
   * painted outside the clip and never seen.
   */
  focusRing?: ButtonVariants["focusRing"];
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<Props>(), {
  as: "button",
});
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :class="
      cn(
        buttonVariants({
          variant: props.variant,
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
