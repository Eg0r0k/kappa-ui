<!--
  Adapted from React Swipe Actions (https://github.com/ncdai/react-primitives), modified for kappa-ui.
  Copyright (c) 2025 ncdai. MIT License: https://github.com/ncdai/react-primitives/blob/main/packages/react-swipe-actions/LICENSE
-->
<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import { type ComponentPublicInstance, ref, watch } from "vue";

import { injectSwipeActionContext, injectSwipeActionsContext } from "./context";

const props = withDefaults(defineProps<PrimitiveProps>(), { as: "span" });

const actions = injectSwipeActionsContext();
const action = injectSwipeActionContext();

const element = ref<HTMLElement>();
const setInstance = (instance: ComponentPublicInstance | Element | null) => {
  const node = instance instanceof Element ? instance : instance?.$el;
  element.value = node instanceof HTMLElement ? node : undefined;
};

watch(
  [element, action],
  ([node, owner], _, onCleanup) => {
    if (!node || !owner) return;
    const observer = new ResizeObserver(() => actions.measure(owner, node.offsetWidth));
    observer.observe(node);
    onCleanup(() => {
      observer.disconnect();
      actions.forget(owner);
    });
  },
  { immediate: true },
);
</script>

<template>
  <Primitive
    :ref="setInstance"
    :as="props.as"
    :as-child="props.asChild"
    :style="{ display: 'flex', pointerEvents: 'auto' }"
  >
    <slot />
  </Primitive>
</template>
