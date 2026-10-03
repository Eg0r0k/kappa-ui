<!--
  Adapted from React Swipe Actions (https://github.com/ncdai/react-primitives), modified for kappa-ui.
  Copyright (c) 2025 ncdai. MIT License: https://github.com/ncdai/react-primitives/blob/main/packages/react-swipe-actions/LICENSE
-->
<script setup lang="ts">
import { Primitive } from "reka-ui";
import { computed, onBeforeUnmount, shallowRef, watchEffect } from "vue";

import { type SwipeActionsProps, injectSwipeItemContext, provideSwipeActionsContext } from "./context";

const props = withDefaults(defineProps<SwipeActionsProps>(), { as: "div", fullSwipe: false });

const item = injectSwipeItemContext();
const widths = shallowRef(new Map<HTMLElement, number>());

const ordered = computed(() =>
  [...widths.value.keys()].sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1)),
);

const total = computed(() => ordered.value.reduce((sum, action) => sum + (widths.value.get(action) ?? 0), 0));

const measure = (action: HTMLElement, width: number) => {
  if (widths.value.get(action) === width) return;
  widths.value = new Map(widths.value).set(action, width);
};

const forget = (action: HTMLElement) => {
  const next = new Map(widths.value);
  next.delete(action);
  widths.value = next;
};

const offsetOf = (action: HTMLElement) => {
  let offset = 0;
  for (const other of ordered.value) {
    if (other === action) break;
    offset += widths.value.get(other) ?? 0;
  }
  return offset;
};

const isOutermost = (action: HTMLElement) => ordered.value.at(-1) === action;

watchEffect(() =>
  item.setStrip(props.side, { width: total.value, fullSwipe: props.fullSwipe, outermost: () => ordered.value.at(-1) }),
);
onBeforeUnmount(() => item.setStrip(props.side, undefined));

provideSwipeActionsContext({ side: computed(() => props.side), measure, forget, offsetOf, isOutermost });

const style = computed(() => ({
  position: "absolute" as const,
  insetBlock: "0",
  width: "100%",
  zIndex: 0,
  [props.side === "start" ? "insetInlineEnd" : "insetInlineStart"]: "100%",
  translate: "var(--swipe-x) 0",
  "--swipe-progress": `var(--swipe-progress-${props.side})`,
  "--swipe-sign": String((props.side === "start" ? -1 : 1) * item.sign.value),
}));
</script>

<template>
  <Primitive
    :as="props.as"
    :as-child="props.asChild"
    :data-side="props.side"
    :data-armed="item.armed.value === props.side ? '' : undefined"
    :inert="item.state.value !== props.side"
    :style="style"
  >
    <slot />
  </Primitive>
</template>
