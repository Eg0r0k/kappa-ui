<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import { computed, type HTMLAttributes, useSlots } from "vue";

import { cn } from "@/lib/utils";
import { type ButtonVariants, buttonVariants } from ".";

interface Props extends PrimitiveProps {
  variant?: ButtonVariants["variant"];
  size?: ButtonVariants["size"];
  touchTarget?: ButtonVariants["touchTarget"];
  loading?: boolean;
  loadingMode?: ButtonVariants["loadingMode"];
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
  loading: false,
  loadingMode: "adjacent",
});

const slots = useSlots();

// A custom spinner is a real element, and Slot accepts exactly one child, so
// it cannot coexist with as-child. In that combination the built-in pseudo
// element is used instead of silently rendering nothing.
const useCustomSpinner = computed(() => Boolean(slots.spinner) && !props.asChild);

const spinnerKind = computed<ButtonVariants["spinner"]>(() =>
  props.loading && !useCustomSpinner.value ? "builtin" : "none",
);

// The built-in spinner is centred by cva through ::before. A custom one needs
// its wrapper positioned instead, which is only possible because as-child is
// already excluded above.
const spinnerWrapperClass = computed(() =>
  props.loadingMode === "replace"
    ? "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    : "contents",
);

// Deliberately not the native `disabled` attribute. Disabling a focused
// button drops it out of the tab order, so the browser moves focus to <body>
// and a keyboard user loses their place mid-action while a screen reader goes
// quiet. aria-disabled keeps the element focusable and announced; the two
// handlers below take away its behaviour instead.
// https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_disabled_controls
const onClick = (event: MouseEvent) => {
  if (!props.loading) return;
  event.stopImmediatePropagation();
  event.preventDefault();
};

// Preventing the default on Enter/Space stops the click from being synthesised
// at all, which makes keyboard blocking independent of listener order.
const onKeydown = (event: KeyboardEvent) => {
  if (!props.loading) return;
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
  }
};
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
          spinner: spinnerKind,
          focusRing: props.focusRing,
        }),
        props.class,
      )
    "
    @click.capture="onClick"
    @keydown.capture="onKeydown"
  >
    <span v-if="props.loading && useCustomSpinner" :class="spinnerWrapperClass" aria-hidden="true">
      <slot name="spinner" />
    </span>
    <slot />
  </Primitive>
</template>
