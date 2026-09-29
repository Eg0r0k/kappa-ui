<script setup lang="ts">
import {
  type PointerDownOutsideEvent,
  TooltipContent,
  type TooltipContentEmits,
  type TooltipContentProps,
  injectTooltipRootContext,
  useForwardPropsEmits,
} from "reka-ui";
import { type ComponentPublicInstance, computed, onScopeDispose, ref, watch, watchPostEffect } from "vue";

import { injectTooltipController } from "./context";

const props = defineProps<TooltipContentProps>();
const emits = defineEmits<TooltipContentEmits>();

const forwarded = useForwardPropsEmits(props, emits);
const controller = injectTooltipController();
const root = injectTooltipRootContext();
const content = ref<ComponentPublicInstance>();

const ariaLabel = computed(() => (controller.role.value === "label" ? " " : props.ariaLabel));

// Reka's TOOLTIP_OPEN, dispatched on document by every tooltip as it opens.
const siblingOpen = "tooltip.open";

const onSiblingOpen = (event: Event) => {
  if (controller.isOpening()) return;
  if (controller.open.value) controller.hide("sibling-open", event);
  else controller.instant.value = true;
};

const onScroll = (event: Event) => {
  const trigger = root.trigger.value;
  if (trigger && (event.target as Node).contains(trigger)) controller.hide("scroll", event);
};

let detach: (() => void) | undefined;

const attach = () => {
  if (detach || typeof window === "undefined") return;
  window.addEventListener(siblingOpen, onSiblingOpen, { capture: true });
  window.addEventListener("scroll", onScroll, { capture: true });
  detach = () => {
    window.removeEventListener(siblingOpen, onSiblingOpen, { capture: true });
    window.removeEventListener("scroll", onScroll, { capture: true });
    detach = undefined;
  };
};

const onAfterLeave = () => {
  if (!controller.open.value) detach?.();
};

watch(
  () => controller.open.value,
  (open) => {
    if (open) attach();
  },
  { immediate: true },
);
onScopeDispose(() => detach?.());

watchPostEffect(() => {
  const hoverable = controller.settings.hoverable;
  const el = controller.open.value ? content.value?.$el : undefined;
  const wrapper = el instanceof HTMLElement ? el.closest<HTMLElement>("[data-reka-popper-content-wrapper]") : null;
  if (wrapper) wrapper.style.pointerEvents = hoverable ? "" : "none";
});

const onEscapeKeyDown = (event: KeyboardEvent) => {
  if (event.isComposing) event.preventDefault();
  else if (!event.defaultPrevented) controller.hide("escape-key", event);
};

const onPointerDownOutside = (event: Event) => {
  if (event.defaultPrevented) return;
  const { originalEvent } = (event as PointerDownOutsideEvent).detail;
  const onTrigger = root.trigger.value?.contains(originalEvent.target as Node);
  controller.hide(onTrigger ? "trigger-press" : "outside-press", originalEvent);
};
</script>

<template>
  <TooltipContent
    ref="content"
    v-bind="forwarded"
    :aria-label="ariaLabel"
    :data-touch="controller.touch.value ? '' : undefined"
    :data-instant="controller.instant.value ? 'sibling' : undefined"
    @escape-key-down="onEscapeKeyDown"
    @pointer-down-outside="onPointerDownOutside"
    @after-leave="onAfterLeave"
  >
    <slot />
  </TooltipContent>
</template>
