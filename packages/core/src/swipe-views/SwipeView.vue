<script setup lang="ts">
import { useResizeObserver } from "@vueuse/core";
import { Primitive } from "reka-ui";
import { type ComponentPublicInstance, computed, onBeforeUnmount, onMounted, ref, watch, watchEffect } from "vue";

import { isDev } from "../internal/dev";
import { type SwipeViewEntry, type SwipeViewProps, injectSwipeViewsRootContext } from "./context";

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

const entry: SwipeViewEntry = { value: () => props.value, size };
onBeforeUnmount(context.register(entry));

const index = computed(() => context.views.value.indexOf(entry));
const active = computed(() => context.resolved.value && index.value === context.active.value);

const pages = (count: number) => `${count * context.sign.value * 100}%`;

// Until the root has measured, and on the server, a page places itself by index; one before the active page rests just outside.
const style = computed(() => {
  const at = index.value;
  if (context.measured.value) {
    return {
      "--swipe-view-index": String(at),
      "--swipe-view-start": `${(context.starts.value[at] ?? 0) * context.sign.value}px`,
    };
  }
  const snap = context.resolved.value && at >= context.active.value ? context.active.value : at + 1;
  return {
    "--swipe-view-index": String(at),
    "--swipe-view-start": pages(at),
    "--swipe-snap-offset": pages(-snap),
    "--swipe-snap-position": String(snap),
  };
});

const focusActivePage = () => {
  const page = context.views.value[context.active.value]?.element;
  if (!page) return;
  page.inert = false;
  if (!page.hasAttribute("tabindex")) page.tabIndex = -1;
  page.focus({ preventScroll: true });
};

onMounted(() => {
  const node = element.value;
  if (!node) return;
  if (isDev && node.parentElement !== context.root.value) {
    console.warn("[kappa-ui] SwipeView must be a direct child of SwipeViews: it inherits the frame's variables.");
  }
  entry.element = node;
  context.resort();
  measure();
});

// Per-gesture state skips the template, so a swipe does not re-render the page.
watchEffect(
  () => {
    const node = element.value;
    if (!node || !context.measured.value) return;
    const inert = !active.value && !context.moving.value;
    if (inert && !node.inert && node.contains(document.activeElement)) focusActivePage();
    node.inert = inert;
  },
  { flush: "post" },
);
</script>

<template>
  <Primitive
    :ref="setInstance"
    :as="props.as"
    :as-child="props.asChild"
    :data-state="active ? 'active' : 'inactive'"
    :data-orientation="context.orientation.value"
    :inert="context.measured.value || active ? undefined : true"
    :style="style"
  >
    <slot :active="active" />
  </Primitive>
</template>
