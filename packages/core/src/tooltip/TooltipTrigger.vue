<script setup lang="ts">
import {
  TooltipTrigger,
  type TooltipTriggerProps,
  injectTooltipProviderContext,
  injectTooltipRootContext,
} from "reka-ui";
import { shallowRef, watch } from "vue";

import { type TooltipReason, injectTooltipController } from "./context";
import { inspectTrigger } from "./dev";
import { isTouchLike } from "./long-press";

const props = defineProps<TooltipTriggerProps>();

const controller = injectTooltipController();
const root = injectTooltipRootContext();
const provider = injectTooltipProviderContext();

const current = shallowRef<HTMLElement>();
let moved = false;
let latched = false;
let pressed = false;
let blockFocus = false;

const close = (reason: TooltipReason, event?: Event) => {
  controller.hide(reason, event);
  root.onClose();
};

const track = (event: Event) => {
  const el = event.currentTarget as HTMLElement;
  if (root.trigger.value === el) return;
  current.value = el;
  root.onTriggerChange(el);
};

const onPointerMove = (event: PointerEvent) => {
  track(event);
  if (isTouchLike(event) || latched || controller.open.value || controller.settings.disabled) return;
  if (provider.isPointerInTransitRef.value) return;
  if ((event.target as Element).closest("[data-grace-area-trigger]") !== event.currentTarget) return;
  if (moved && event.movementX ** 2 + event.movementY ** 2 < controller.settings.restThreshold) return;
  moved = true;
  controller.request("trigger-hover", event);
  root.onTriggerEnter();
};

const onPointerLeave = (event: PointerEvent) => {
  if (isTouchLike(event)) return;
  moved = false;
  latched = false;
  if (controller.settings.hoverable) root.onTriggerLeave();
  else close("trigger-hover", event);
};

const onPointerDown = (event: PointerEvent) => {
  track(event);
  pressed = true;
  const released = new AbortController();
  const release = () => {
    released.abort();
    setTimeout(() => {
      pressed = false;
    }, 1);
  };
  const doc = (event.currentTarget as HTMLElement).ownerDocument;
  doc.addEventListener("pointerup", release, { signal: released.signal });
  doc.addEventListener("pointercancel", release, { signal: released.signal });
  if (isTouchLike(event)) return;
  latched = true;
  if (controller.settings.closeOnClick) close("trigger-press", event);
};

const onClick = (event: MouseEvent) => {
  if (controller.settings.closeOnClick) close("trigger-press", event);
};

const onFocusIn = (event: FocusEvent) => {
  track(event);
  if (blockFocus) {
    blockFocus = false;
    return;
  }
  if (pressed || controller.settings.disabled || !(event.target as Element).matches(":focus-visible")) return;
  controller.request("trigger-focus", event);
  root.onOpen();
};

const onFocusOut = (event: FocusEvent) => {
  const trigger = event.currentTarget as HTMLElement;
  if (trigger.contains(event.relatedTarget as Node | null)) return;
  blockFocus = trigger.contains(trigger.ownerDocument.activeElement);
  close("trigger-focus", event);
};

watch(
  () => root.trigger.value,
  (el) => {
    if (el) inspectTrigger(el, controller.role.value);
  },
  { immediate: true },
);

watch(
  () => controller.forced.value,
  () => root.onOpen(),
);

watch(
  () => controller.open.value,
  (open) => {
    if (!open && controller.closedBy.value === "escape-key") latched = true;
  },
);

watch(
  [() => controller.open.value, () => root.trigger.value],
  ([open, el], _, onCleanup) => {
    if (!open || !el) return;
    if (controller.role.value === "label") el.removeAttribute("aria-describedby");
    const observer = new MutationObserver(() => {
      if (!el.isConnected || el.matches(":disabled")) close("disabled");
    });
    observer.observe(el, { attributes: true, attributeFilter: ["disabled"] });
    if (el.parentNode) observer.observe(el.parentNode, { childList: true });
    onCleanup(() => observer.disconnect());
  },
  { flush: "post" },
);
</script>

<template>
  <TooltipTrigger
    v-bind="props"
    :reference="props.reference ?? current"
    @pointermove="onPointerMove"
    @pointerleave="onPointerLeave"
    @pointerdown="onPointerDown"
    @click="onClick"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <slot />
  </TooltipTrigger>
</template>
