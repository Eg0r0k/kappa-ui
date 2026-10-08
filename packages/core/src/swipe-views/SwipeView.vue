<script setup lang="ts">
import { useResizeObserver } from "@vueuse/core";
import { Primitive } from "reka-ui";
import { type ComponentPublicInstance, computed, onBeforeUnmount, onMounted, ref, watch, watchEffect } from "vue";

import { isDev } from "../internal/dev";
import { type SwipeViewProps, injectSwipeViewsRootContext } from "./context";

const props = withDefaults(defineProps<SwipeViewProps>(), { as: "div" });
const context = injectSwipeViewsRootContext();

const element = ref<HTMLElement>();
const setInstance = (instance: ComponentPublicInstance | Element | null) => {
  const node = instance instanceof Element ? instance : instance?.$el;
  element.value = node instanceof HTMLElement ? node : undefined;
};

const size = ref(0);
const measure = () => {
  const node = element.value;
  if (node) size.value = context.orientation.value === "vertical" ? node.offsetHeight : node.offsetWidth;
};
useResizeObserver(element, measure);
watch(context.orientation, measure);

const index = computed(() => context.views.value.findIndex((view) => view.element === element.value));
const active = computed(() => index.value !== -1 && index.value === context.active.value);

let unregister: (() => void) | undefined;

onMounted(() => {
  const node = element.value;
  if (!node) return;
  if (isDev && node.parentElement !== context.root.value) {
    console.warn("[kappa-ui] SwipeView must be a direct child of SwipeViews: it inherits the frame's variables.");
  }
  measure();
  unregister = context.register({ element: node, value: () => props.value, size });
});

onBeforeUnmount(() => unregister?.());

// Per-gesture state skips the template, so a swipe does not re-render the page.
watchEffect(() => {
  const node = element.value;
  if (!node || index.value === -1) return;
  node.dataset.state = active.value ? "active" : "inactive";
  node.dataset.orientation = context.orientation.value;
  node.inert = !active.value && !context.moving.value;
  node.style.setProperty("--swipe-view-index", String(index.value));
  node.style.setProperty("--swipe-view-start", `${(context.starts.value[index.value] ?? 0) * context.sign.value}px`);
});
</script>

<template>
  <Primitive :ref="setInstance" :as="props.as" :as-child="props.asChild">
    <slot :active="active" />
  </Primitive>
</template>
