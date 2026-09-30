<script setup lang="ts">
import {
  type FocusOutsideEvent,
  HoverCardContent,
  type HoverCardContentProps,
  type PointerDownOutsideEvent,
  injectHoverCardRootContext,
  useForwardProps,
} from "reka-ui";
import { type ComponentPublicInstance, onScopeDispose, ref, watch } from "vue";

import { isTouchLike } from "../internal/long-press";
import { trackTap } from "../internal/tap";
import { type HoverCardContentEmits, injectHoverCardController } from "./context";

const props = defineProps<HoverCardContentProps>();
const emits = defineEmits<HoverCardContentEmits>();

const forwarded = useForwardProps(props);
const controller = injectHoverCardController();
const root = injectHoverCardRootContext();
const content = ref<ComponentPublicInstance>();

let stopTap: (() => void) | undefined;

const onPointerDown = (event: PointerEvent) => {
  const target = event.target as Node;
  const el = content.value?.$el as HTMLElement | undefined;
  if (el?.contains(target)) return;
  const onTrigger = root.triggerElement.value?.contains(target) ?? false;
  if (isTouchLike(event)) {
    if (onTrigger) return;
    stopTap?.();
    stopTap = trackTap(event, (up) => {
      stopTap = undefined;
      controller.hide("outside-press", up);
    });
    return;
  }
  controller.hide(onTrigger ? "trigger-press" : "outside-press", event);
};

let detach: (() => void) | undefined;

const attach = () => {
  if (detach || typeof document === "undefined") return;
  document.addEventListener("pointerdown", onPointerDown, { capture: true });
  detach = () => {
    document.removeEventListener("pointerdown", onPointerDown, { capture: true });
    stopTap?.();
    stopTap = undefined;
    detach = undefined;
  };
};

watch(
  () => controller.open.value,
  (open) => {
    if (open) attach();
    else detach?.();
  },
  { immediate: true },
);
onScopeDispose(() => detach?.());

const onEscapeKeyDown = (event: KeyboardEvent) => {
  emits("escapeKeyDown", event);
  if (event.isComposing) event.preventDefault();
  else if (!event.defaultPrevented) controller.hide("escape-key", event);
};

const onPointerDownOutside = (event: PointerDownOutsideEvent) => {
  emits("pointerDownOutside", event);
  event.preventDefault();
};

const onFocusOutside = (event: FocusOutsideEvent) => {
  emits("focusOutside", event);
  event.preventDefault();
};

const onInteractOutside = (event: PointerDownOutsideEvent | FocusOutsideEvent) => emits("interactOutside", event);
</script>

<template>
  <HoverCardContent
    ref="content"
    v-bind="forwarded"
    :data-touch="controller.touch.value ? '' : undefined"
    @escape-key-down="onEscapeKeyDown"
    @pointer-down-outside="onPointerDownOutside"
    @focus-outside="onFocusOutside"
    @interact-outside="onInteractOutside"
  >
    <slot />
  </HoverCardContent>
</template>
