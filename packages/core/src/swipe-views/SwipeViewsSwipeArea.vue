<script setup lang="ts">
import { Primitive } from "reka-ui";
import { type ComponentPublicInstance, computed, ref } from "vue";

import { type SwipeViewsSwipeAreaProps, injectSwipeViewsRootContext } from "./context";

const props = withDefaults(defineProps<SwipeViewsSwipeAreaProps>(), { as: "div" });
const context = injectSwipeViewsRootContext();

const element = ref<HTMLElement>();
const setInstance = (instance: ComponentPublicInstance | Element | null) => {
  const node = instance instanceof Element ? instance : instance?.$el;
  element.value = node instanceof HTMLElement ? node : undefined;
};

const reachable = computed(() => {
  const next = context.active.value + (props.side === "start" ? -1 : 1);
  return next >= 0 && next < context.views.value.length;
});

context.attach(element, {
  canStart: (move) => reachable.value && (props.side === "start" ? move.direction > 0 : move.direction < 0),
});
</script>

<template>
  <Primitive
    :ref="setInstance"
    :as="props.as"
    :as-child="props.asChild"
    aria-hidden="true"
    :data-side="props.side"
    :data-orientation="context.orientation.value"
    :data-disabled="reachable ? undefined : ''"
  >
    <slot />
  </Primitive>
</template>
