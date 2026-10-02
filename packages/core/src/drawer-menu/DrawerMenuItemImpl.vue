<script setup lang="ts">
import { Primitive, RovingFocusItem } from "reka-ui";
import { ref } from "vue";

import type { DrawerMenuItemProps } from "./context";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<DrawerMenuItemProps>(), { as: "div" });

const highlighted = ref(false);

const onFocus = (event: FocusEvent) => {
  highlighted.value = (event.currentTarget as HTMLElement).matches(":focus-visible");
};

const onPointermove = (event: PointerEvent) => {
  if (event.pointerType === "touch" || props.disabled) return;
  const target = event.currentTarget as HTMLElement;
  if (document.activeElement !== target) target.focus({ preventScroll: true });
  highlighted.value = true;
};

const onPointerleave = (event: PointerEvent) => {
  if (event.pointerType !== "touch") highlighted.value = false;
};

const onKeydown = (event: KeyboardEvent) => {
  if (props.disabled || (event.key !== "Enter" && event.key !== " ")) return;
  event.preventDefault();
  (event.currentTarget as HTMLElement).click();
};
</script>

<template>
  <RovingFocusItem as-child :focusable="!props.disabled">
    <Primitive
      v-bind="$attrs"
      :as="props.as"
      :as-child="props.asChild"
      :aria-disabled="props.disabled || undefined"
      :data-highlighted="highlighted ? '' : undefined"
      @focus="onFocus"
      @blur="highlighted = false"
      @pointermove="onPointermove"
      @pointerleave="onPointerleave"
      @keydown="onKeydown"
    >
      <slot />
    </Primitive>
  </RovingFocusItem>
</template>
