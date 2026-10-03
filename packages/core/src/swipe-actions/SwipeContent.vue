<!--
  Adapted from React Swipe Actions (https://github.com/ncdai/react-primitives), modified for kappa-ui.
  Copyright (c) 2025 ncdai. MIT License: https://github.com/ncdai/react-primitives/blob/main/packages/react-swipe-actions/LICENSE
-->
<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "reka-ui";
import type { ComponentPublicInstance } from "vue";

import { injectSwipeItemContext } from "./context";

const props = withDefaults(defineProps<PrimitiveProps>(), { as: "div" });

const item = injectSwipeItemContext();

const setInstance = (instance: ComponentPublicInstance | Element | null) => {
  const node = instance instanceof Element ? instance : instance?.$el;
  item.content.value = node instanceof HTMLElement ? node : undefined;
};
</script>

<template>
  <Primitive
    :ref="setInstance"
    :as="props.as"
    :as-child="props.asChild"
    :data-dragging="item.dragging.value ? '' : undefined"
    :style="{ position: 'relative', zIndex: 1, translate: 'var(--swipe-x) 0' }"
  >
    <slot />
  </Primitive>
</template>
