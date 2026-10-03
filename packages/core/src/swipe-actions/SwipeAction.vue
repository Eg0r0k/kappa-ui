<!--
  Adapted from React Swipe Actions (https://github.com/ncdai/react-primitives), modified for kappa-ui.
  Copyright (c) 2025 ncdai. MIT License: https://github.com/ncdai/react-primitives/blob/main/packages/react-swipe-actions/LICENSE
-->
<script setup lang="ts">
import { Primitive } from "reka-ui";
import { type ComponentPublicInstance, computed, ref } from "vue";

import {
  type SwipeActionProps,
  injectSwipeActionsContext,
  injectSwipeItemContext,
  provideSwipeActionContext,
} from "./context";

const props = withDefaults(defineProps<SwipeActionProps>(), { as: "button", closeOnClick: true });

const item = injectSwipeItemContext();
const actions = injectSwipeActionsContext();

const element = ref<HTMLElement>();
const setInstance = (instance: ComponentPublicInstance | Element | null) => {
  const node = instance instanceof Element ? instance : instance?.$el;
  element.value = node instanceof HTMLElement ? node : undefined;
};
provideSwipeActionContext(element);

const armed = computed(
  () => item.armed.value === actions.side.value && !!element.value && actions.isOutermost(element.value),
);

const style = computed(() => ({
  position: "absolute" as const,
  inset: "0",
  display: "flex",
  pointerEvents: "none" as const,
  justifyContent: actions.side.value === "start" ? "flex-end" : "flex-start",
  "--swipe-before": `${element.value ? actions.offsetOf(element.value) : 0}px`,
  translate: "calc(var(--swipe-before) * var(--swipe-progress) * var(--swipe-spread) * var(--swipe-sign)) 0",
}));

const onClick = () => {
  if (props.closeOnClick) item.close();
};
</script>

<template>
  <Primitive
    :ref="setInstance"
    :as="props.as"
    :as-child="props.asChild"
    :type="props.as === 'button' && !props.asChild ? 'button' : undefined"
    :data-armed="armed ? '' : undefined"
    :style="style"
    @click="onClick"
  >
    <slot />
  </Primitive>
</template>
