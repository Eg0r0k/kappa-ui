<script setup lang="ts">
import { useMutationObserver, useResizeObserver, useVModel } from "@vueuse/core";
import { Primitive, useDirection } from "reka-ui";
import { type ComponentPublicInstance, computed, onMounted, ref, shallowRef, toRef, watch } from "vue";

import { isDev } from "../internal/dev";
import { useSwipeSnap } from "../swipe-snap";
import {
  type SwipeViewEntry,
  type SwipeViewsRootEmits,
  type SwipeViewsRootProps,
  type SwipeViewsValue,
  provideSwipeViewsRootContext,
} from "./context";

const props = withDefaults(defineProps<SwipeViewsRootProps>(), {
  as: "div",
  modelValue: undefined,
  defaultValue: undefined,
  orientation: "horizontal",
  sequential: true,
  disabled: false,
  swipeAreaOnly: false,
});
const emits = defineEmits<SwipeViewsRootEmits>();

const model = useVModel(props, "modelValue", emits, {
  defaultValue: props.defaultValue,
  passive: (props.modelValue === undefined) as false,
});
const dir = useDirection(toRef(() => props.dir));
const vertical = computed(() => props.orientation === "vertical");
const sign = computed<1 | -1>(() => (!vertical.value && dir.value === "rtl" ? -1 : 1));

const root = ref<HTMLElement>();
const setInstance = (instance: ComponentPublicInstance | Element | null) => {
  const node = instance instanceof Element ? instance : instance?.$el;
  root.value = node instanceof HTMLElement ? node : undefined;
};

const views = shallowRef<SwipeViewEntry[]>([]);
const viewport = ref(0);

const measure = () => {
  const node = root.value;
  if (node) viewport.value = vertical.value ? node.clientHeight : node.clientWidth;
};
useResizeObserver(root, measure);
watch(vertical, measure);

const starts = computed(() => {
  let total = 0;
  return views.value.map((view) => {
    const start = total;
    total += view.size.value;
    return start;
  });
});
const points = computed(() => {
  const total = views.value.reduce((sum, view) => sum + view.size.value, 0);
  const end = Math.max(0, total - viewport.value);
  return starts.value.map((start) => Math.min(start, end));
});

const active = ref(0);
const snap = useSwipeSnap(root, {
  points,
  active,
  axis: () => (vertical.value ? "y" : "x"),
  rtl: () => sign.value < 0,
  enabled: () => !props.disabled,
  sequential: () => props.sequential,
  canStart: () => !props.swipeAreaOnly,
});
const moving = computed(() => snap.dragging.value || snap.settling.value);

const indexOf = (value: SwipeViewsValue | undefined) => views.value.findIndex((view) => view.value() === value);

const ordered = (list: SwipeViewEntry[]) =>
  [...list].sort((a, b) => (a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));

const register = (entry: SwipeViewEntry) => {
  views.value = ordered([...views.value, entry]);
  return () => {
    views.value = views.value.filter((view) => view !== entry);
  };
};

useMutationObserver(root, () => (views.value = ordered(views.value)), { childList: true });

onMounted(() => {
  measure();
  const index = indexOf(model.value);
  if (index === -1 && model.value !== undefined && isDev) {
    console.warn(`[kappa-ui] SwipeViews has no SwipeView with the value ${String(model.value)}.`);
  }
  snap.snapTo(Math.max(0, index), { animate: false });
});

watch(model, (value) => {
  const index = indexOf(value);
  if (index !== -1) active.value = index;
});

watch(active, (index) => {
  const value = views.value[index]?.value();
  if (value !== undefined && value !== model.value) model.value = value;
});

watch(views, (list, previous) => {
  const index = indexOf(model.value);
  if (index !== -1) {
    if (index !== active.value) snap.snapTo(index, { animate: false });
    return;
  }
  if (list.length === 0 || !previous.some((view) => view.value() === model.value)) return;
  const fallback = Math.min(active.value, list.length - 1);
  snap.snapTo(fallback, { animate: false });
  model.value = list[fallback]!.value();
});

provideSwipeViewsRootContext({
  root,
  orientation: computed(() => props.orientation),
  sign,
  views,
  starts,
  active,
  moving,
  register,
  attach: snap.attach,
});

defineExpose({ position: snap.position });
</script>

<template>
  <Primitive
    :ref="setInstance"
    :as="props.as"
    :as-child="props.asChild"
    :data-orientation="props.orientation"
    :data-disabled="props.disabled ? '' : undefined"
  >
    <slot :model-value="model" :dragging="snap.dragging.value" :settling="snap.settling.value" />
  </Primitive>
</template>
