<script setup lang="ts">
import { useResizeObserver } from "@vueuse/core";
import { type DialogContentEmits, type DialogContentProps, useForwardPropsEmits } from "reka-ui";
import { type ComponentPublicInstance, computed, nextTick, ref, watch } from "vue";

import DialogContent from "../dialog/DialogContent.vue";
import { useOwnDialogEntry } from "../dialog/entry";
import { opposite, releaseVerdict, scrollBlocksDrag, useDrag } from "../drag";
import { scrollFocusedIntoView, useVirtualKeyboardInset } from "../virtual-keyboard";
import { injectDrawerRootContext } from "./context";

const props = defineProps<DialogContentProps>();
const emits = defineEmits<DialogContentEmits>();

const forwarded = useForwardPropsEmits(props, emits);
const context = injectDrawerRootContext();
const owner = useOwnDialogEntry();

const instance = ref<ComponentPublicInstance>();
const element = ref<HTMLElement>();
const interrupted = ref(false);
const vertical = computed(() => context.side.value === "bottom" || context.side.value === "top");

const measure = () => {
  const node = element.value;
  if (node) context.size.value = vertical.value ? node.offsetHeight : node.offsetWidth;
};

const locate = async () => {
  await nextTick();
  const node = instance.value?.$el;
  element.value = node instanceof HTMLElement ? node : undefined;
  measure();
};

watch(
  () => context.open.value,
  (open) => {
    if (open && context.swiping.value) interrupted.value = true;
    if (open && !context.swiping.value) {
      context.movement.value = 0;
      interrupted.value = false;
    }
    void locate();
  },
  { immediate: true, flush: "post" },
);

useResizeObserver(element, measure);

const inset = useVirtualKeyboardInset(() => context.open.value);
watch(inset, (value) => {
  context.keyboardInset.value = value;
  if (element.value) scrollFocusedIntoView(element.value);
});

const lengthOf = (token: string, size: number) => {
  const signed = token.replace(/-\s+/g, "-");
  const sum = (pattern: RegExp) => [...signed.matchAll(pattern)].reduce((total, match) => total + Number(match[1]), 0);
  return sum(/(-?\d*\.?\d+(?:e[-+]?\d+)?)px/gi) + (sum(/(-?\d*\.?\d+(?:e[-+]?\d+)?)%/gi) * size) / 100;
};

const axisTranslate = () => {
  const node = element.value;
  if (!node) return 0;
  const parts = getComputedStyle(node).translate.match(/[a-z-]*\([^)]*\)|\S+/gi) ?? [];
  return lengthOf((vertical.value ? parts[1] : parts[0]) ?? "", context.size.value);
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
  bounds: () => ({ min: -currentMovement() }),
  canStart: (move) => {
    const handle = inHandle(move.target);
    if (context.handleOnly.value && !handle) return false;
    if (handle || !element.value || move.direction === 0) return true;
    const towards = move.direction > 0 ? context.side.value : opposite(context.side.value);
    return !scrollBlocksDrag(move.target, element.value, towards);
  },
  mouseFrom: (target) => target.closest("[data-drawer-handle], [data-drawer-drag]") !== null,
  onStart: () => {
    seed = currentMovement();
    context.swiping.value = true;
    interrupted.value = true;
  },
  onMove: (move) => {
    context.movement.value = seed + move.movement;
  },
  onRelease: (move) => {
    finish();
    const closable = context.dismissible.value && !owner?.entry.loading;
    if (closable && releaseVerdict(move.movement, context.size.value, move.swipe) === "close") {
      context.movement.value = Math.max(0, seed + move.movement);
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
  "--drawer-in": interrupted.value ? "none" : undefined,
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
