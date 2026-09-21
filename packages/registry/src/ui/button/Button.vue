<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";

import { cn } from "@/lib/utils";
import { type ButtonVariants, buttonVariants } from ".";

interface Props extends PrimitiveProps {
  variant?: ButtonVariants["variant"];
  size?: ButtonVariants["size"];
  touchTarget?: ButtonVariants["touchTarget"];
  loading?: boolean;
  loadingMode?: ButtonVariants["loadingMode"];
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<Props>(), {
  as: "button",
  loading: false,
  loadingMode: "adjacent",
});

// Deliberately not the native `disabled` attribute. Disabling a focused
// button drops it out of the tab order, so the browser moves focus to <body>
// and a keyboard user loses their place mid-action while a screen reader goes
// quiet. aria-disabled keeps the element focusable and announced; the two
// handlers below take away its behaviour instead.
// https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_disabled_controls
function onClick(event: MouseEvent) {
  if (!props.loading) return;
  event.stopImmediatePropagation();
  event.preventDefault();
}

// Preventing the default on Enter/Space stops the click from being synthesised
// at all, which makes keyboard blocking independent of listener order.
function onKeydown(event: KeyboardEvent) {
  if (!props.loading) return;
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
  }
}
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :aria-disabled="props.loading || undefined"
    :aria-busy="props.loading || undefined"
    :class="
      cn(
        buttonVariants({
          variant: props.variant,
          size: props.size,
          touchTarget: props.touchTarget,
          loading: props.loading,
          loadingMode: props.loadingMode,
        }),
        props.class,
      )
    "
    @click.capture="onClick"
    @keydown.capture="onKeydown"
  >
    <slot />
  </Primitive>
</template>
