<script setup lang="ts">
import { useResizeObserver } from "@vueuse/core";
import { type DialogContentEmits, type DialogContentProps, useForwardPropsEmits } from "reka-ui";
import { type ComponentPublicInstance, computed, nextTick, ref, watch } from "vue";

import DialogContent from "../dialog/DialogContent.vue";
import { useOwnDialogEntry } from "../dialog/entry";
import { releaseVerdict, scrollBlocksDrag, useDrag } from "../drag";
import { scrollFocusedIntoView, useVirtualKeyboardInset } from "../virtual-keyboard";
import { injectDrawerRootContext } from "./context";

const props = defineProps<DialogContentProps>();
const emits = defineEmits<DialogContentEmits>();

const forwarded = useForwardPropsEmits(props, emits);
const context = injectDrawerRootContext();
const owner = useOwnDialogEntry();

const instance = ref<ComponentPublicInstance>();
const element = ref<HTMLElement>();
const vertical = computed(() => context.side.value === "bottom" || context.side.value === "top");

const locate = async () => {
  await nextTick();
  const node = instance.value?.$el;
  element.value = node instanceof HTMLElement ? node : undefined;
};

watch(
  () => context.open.value,
  (open) => {
    if (open && !context.swiping.value) context.movement.value = 0;
    void locate();
  },
  { immediate: true, flush: "post" },
);

useResizeObserver(element, () => {
  const node = element.value;
  if (node) context.size.value = vertical.value ? node.offsetHeight : node.offsetWidth;
});

const inset = useVirtualKeyboardInset(() => context.open.value);
watch(inset, (value) => {
  context.keyboardInset.value = value;
  if (element.value) scrollFocusedIntoView(element.value);
});

const axisTranslate = () => {
  const node = element.value;
  if (!node) return 0;
  const parts = getComputedStyle(node).translate.split(" ");
  const value = parseFloat((vertical.value ? parts[1] : parts[0]) ?? "0");
  return Number.isNaN(value) ? 0 : value;
};

const currentMovement = () => {
  const sign = context.side.value === "bottom" || context.side.value === "right" ? 1 : -1;
  const keyboard = context.side.value === "bottom" ? context.keyboardInset.value : 0;
  return Math.max(0, axisTranslate() * sign - context.snapOffset.value + keyboard);
};

const inHandle = (target: Element) => target.closest("[data-drawer-handle]") !== null;

let seed = 0;

const finish = () => {
  context.swiping.value = false;
  context.dragged.value = true;
  setTimeout(() => {
    context.dragged.value = false;
  }, 0);
};

useDrag(element, {
  towards: () => context.side.value,
  enabled: () => context.open.value,
  bounds: { min: 0 },
  canStart: (move) => {
    const handle = inHandle(move.target);
    if (context.handleOnly.value && !handle) return false;
    if (
      !handle &&
      move.direction > 0 &&
      element.value &&
      scrollBlocksDrag(move.target, element.value, context.side.value)
    ) {
      return false;
    }
    return true;
  },
  mouseFrom: (target) => target.closest("[data-drawer-handle], [data-drawer-drag]") !== null,
  onStart: () => {
    seed = currentMovement();
    context.swiping.value = true;
  },
  onMove: (move) => {
    context.movement.value = seed + move.movement;
  },
  onRelease: (move) => {
    finish();
    const movement = seed + move.movement;
    if (context.dismissible.value && releaseVerdict(movement, context.size.value, move.swipe) === "close") {
      context.movement.value = Math.max(0, movement);
      if (owner) owner.entry.reason = "swipe";
      context.setOpen(false);
      return;
    }
    context.movement.value = 0;
  },
  onCancel: () => {
    finish();
    context.movement.value = 0;
  },
});

const style = computed(() => ({
  "--drawer-size": `${context.size.value}px`,
  "--drawer-swipe-movement": `${context.movement.value}px`,
  "--drawer-swipe-progress": String(context.progress.value),
  "--drawer-snap-offset": `${context.snapOffset.value}px`,
  "--drawer-keyboard-inset": `${context.keyboardInset.value}px`,
}));
</script>

<template>
  <DialogContent
    ref="instance"
    v-bind="forwarded"
    :data-side="context.side.value"
    :data-swiping="context.swiping.value ? '' : undefined"
    :style="style"
  >
    <slot />
  </DialogContent>
</template>
