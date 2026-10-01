<script setup lang="ts">
import { useVModel, useWindowSize } from "@vueuse/core";
import { DialogRoot } from "reka-ui";
import { type Ref, computed, ref, watch } from "vue";

import { type SnapPoint, toPixels } from "../snap";
import { type DrawerRootEmits, type DrawerRootProps, provideDrawerRootContext } from "./context";

const props = withDefaults(defineProps<DrawerRootProps>(), {
  side: "bottom",
  dismissible: true,
  handleOnly: false,
  snapPoints: undefined,
  activeSnapPoint: undefined,
  snapToSequentialPoints: false,
  fadeFromIndex: undefined,
  open: undefined,
  defaultOpen: undefined,
  modal: undefined,
  unmountOnHide: undefined,
});
const emits = defineEmits<DrawerRootEmits>();

const open = useVModel(props, "open", emits, {
  defaultValue: props.defaultOpen ?? false,
  passive: (props.open === undefined) as false,
});
const isOpen = computed(() => open.value === true);

const snapPoints = computed(() => props.snapPoints ?? []);
const activeSnapPoint = useVModel(props, "activeSnapPoint", emits, {
  defaultValue: props.snapPoints?.[0] ?? null,
  passive: (props.activeSnapPoint === undefined) as false,
}) as Ref<SnapPoint | null>;

const size = ref(0);
const movement = ref(0);

const { width, height } = useWindowSize({ initialWidth: 0, initialHeight: 0 });
const viewport = computed(() => (props.side === "bottom" || props.side === "top" ? height.value : width.value));
const snapPixels = computed(() =>
  snapPoints.value.map((point) => {
    const pixels = toPixels(point, viewport.value);
    return size.value > 0 ? Math.min(size.value, pixels) : pixels;
  }),
);
const activeIndex = computed(() => {
  const index = snapPoints.value.indexOf(activeSnapPoint.value ?? snapPoints.value[0]!);
  return index === -1 ? 0 : index;
});
const visibleAtActive = computed(() => {
  const point = activeSnapPoint.value ?? snapPoints.value[0];
  return point === undefined ? size.value : Math.min(size.value, toPixels(point, viewport.value));
});
const liveSnapOffset = computed(() => Math.max(0, size.value - visibleAtActive.value));
const fadeIndex = computed(() => {
  const last = snapPixels.value.length - 1;
  return Math.min(last, Math.max(0, props.fadeFromIndex ?? last));
});
const liveOverlayOpacity = computed(() => {
  const pixels = snapPixels.value;
  if (pixels.length === 0) return 1;
  const high = pixels[fadeIndex.value]!;
  const low = fadeIndex.value > 0 ? pixels[fadeIndex.value - 1]! : 0;
  const visible = size.value - liveSnapOffset.value - movement.value;
  if (high <= low) return visible >= high ? 1 : 0;
  return Math.min(1, Math.max(0, (visible - low) / (high - low)));
});

const held = ref({ offset: 0, opacity: 1 });
watch(
  isOpen,
  (value) => {
    if (value) return;
    held.value = { offset: liveSnapOffset.value, opacity: liveOverlayOpacity.value };
    const first = snapPoints.value[0] ?? null;
    if (activeSnapPoint.value !== first) activeSnapPoint.value = first;
  },
  { flush: "sync" },
);

provideDrawerRootContext({
  side: computed(() => props.side),
  dismissible: computed(() => props.dismissible),
  handleOnly: computed(() => props.handleOnly),
  open: isOpen,
  size,
  movement,
  progress: computed(() => (size.value > 0 ? Math.min(1, Math.max(0, movement.value / size.value)) : 0)),
  swiping: ref(false),
  dragged: ref(false),
  keyboardInset: ref(0),
  snapPoints,
  snapPixels,
  activeSnapPoint,
  activeSnapIndex: activeIndex,
  snapToSequentialPoints: computed(() => props.snapToSequentialPoints),
  expanded: computed(() => snapPoints.value.length === 0 || activeIndex.value === snapPoints.value.length - 1),
  snapOffset: computed(() => (isOpen.value ? liveSnapOffset.value : held.value.offset)),
  overlayOpacity: computed(() => (isOpen.value ? liveOverlayOpacity.value : held.value.opacity)),
  setOpen: (value) => {
    open.value = value;
  },
});
</script>

<template>
  <DialogRoot
    v-slot="slotProps"
    :open="open === true"
    :modal="props.modal"
    :unmount-on-hide="props.unmountOnHide"
    @update:open="open = $event"
  >
    <slot v-bind="slotProps" />
  </DialogRoot>
</template>
