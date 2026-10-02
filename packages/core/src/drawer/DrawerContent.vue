<script setup lang="ts">
import { useResizeObserver } from "@vueuse/core";
import { type DialogContentEmits, type DialogContentProps, useForwardPropsEmits } from "reka-ui";
import { type ComponentPublicInstance, computed, nextTick, ref, watch, watchEffect } from "vue";

import DialogContent from "../dialog/DialogContent.vue";
import { useOwnDialogEntry } from "../dialog/entry";
import { opposite, releaseVerdict, scrollBlocksDrag, useDrag } from "../drag";
import { resolveSnapPoint } from "../snap";
import { scrollFocusedIntoView, useVirtualKeyboardInset } from "../virtual-keyboard";
import { injectDrawerRootContext } from "./context";

const props = defineProps<DialogContentProps>();
const emits = defineEmits<DialogContentEmits>();

const forwarded = useForwardPropsEmits(props, emits);
const context = injectDrawerRootContext();
const owner = useOwnDialogEntry();

const above = computed(() => {
  const entries = context.stack.entries.value;
  const index = entries.indexOf(context.entry);
  return index === -1 ? [] : entries.slice(index + 1);
});
const nestedSwiping = computed(() => above.value.some((entry) => entry.swiping.value));

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

watch(
  () => context.open.value,
  (open) => {
    if (!open && context.swiping.value) context.swiping.value = false;
  },
  { flush: "sync" },
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
  return axisTranslate() * sign - context.snapOffset.value + keyboard;
};

const headroom = () => {
  const pixels = context.snapPixels.value;
  if (pixels.length === 0) return 0;
  const largest = Math.max(0, context.size.value - Math.min(context.size.value, Math.max(...pixels)));
  return largest - context.snapOffset.value;
};

const keepUnlessDismissible = (event: Event) => {
  if (!context.dismissible.value) event.preventDefault();
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

const close = (movement: number) => {
  context.movement.value = Math.max(0, movement);
  if (owner) owner.entry.reason = "swipe";
  context.setOpen(false);
};

useDrag(element, {
  towards: () => context.side.value,
  enabled: () => context.open.value,
  bounds: () => ({ min: headroom() - currentMovement() }),
  canStart: (move) => {
    const handle = inHandle(move.target);
    if (context.handleOnly.value && !handle) return false;
    if (handle || !context.expanded.value || !element.value || move.direction === 0) return true;
    const towards = move.direction > 0 ? context.side.value : opposite(context.side.value);
    return !scrollBlocksDrag(move.target, element.value, towards);
  },
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
    const pixels = context.snapPixels.value;
    if (pixels.length > 0) {
      const visible = context.size.value - context.snapOffset.value - (seed + move.movement);
      const index = resolveSnapPoint(pixels, visible, -move.velocity, {
        sequential: context.snapToSequentialPoints.value,
        dismissible: closable,
        active: context.activeSnapIndex.value,
      });
      if (index === null) return close(seed + move.movement);
      const point = context.snapPoints.value[index]!;
      if (context.activeSnapPoint.value !== point) context.activeSnapPoint.value = point;
      context.movement.value = 0;
      return;
    }
    if (closable && releaseVerdict(move.movement, context.size.value, move.velocity) === "close") {
      return close(seed + move.movement);
    }
    context.movement.value = 0;
  },
  onCancel: () => {
    finish();
    if (context.open.value) context.movement.value = 0;
  },
});

const style = computed(() => ({
  "--drawer-size": `${context.size.value}px`,
  "--drawer-snap-offset": `${context.snapOffset.value}px`,
  "--drawer-keyboard-inset": `${context.keyboardInset.value}px`,
  "--drawer-nested": String(above.value.length),
  "--drawer-in": interrupted.value ? "none" : undefined,
}));

// Per-frame values skip :style so a drag does not re-render the slot.
watchEffect(() => {
  const node = element.value;
  if (!node) return;
  node.style.setProperty("--drawer-swipe-movement", `${context.movement.value}px`);
  node.style.setProperty("--drawer-swipe-progress", String(context.progress.value));
  node.style.setProperty(
    "--drawer-nested-progress",
    String(above.value.reduce((depth, entry) => depth + entry.presence.value, 0)),
  );
});
</script>

<template>
  <DialogContent
    ref="instance"
    v-bind="forwarded"
    :data-side="context.side.value"
    :data-swiping="context.swiping.value ? '' : undefined"
    :data-expanded="context.expanded.value ? '' : undefined"
    :data-nested-open="above.length > 0 ? '' : undefined"
    :data-nested-swiping="nestedSwiping ? '' : undefined"
    :style="style"
    @escape-key-down="keepUnlessDismissible"
    @interact-outside="keepUnlessDismissible"
  >
    <slot />
  </DialogContent>
</template>
