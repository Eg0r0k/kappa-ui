<script setup lang="ts">
import { TooltipTrigger, injectTooltipRootContext } from "reka-ui";
import { onBeforeUnmount, onMounted, watch } from "vue";

import { injectTooltipController } from "./context";
import { hasOwnName } from "./dev";
import { toggleToken, useTriggerBehaviour } from "./trigger";

const props = defineProps<{ element: HTMLElement; label?: string }>();

const controller = injectTooltipController();
const root = injectTooltipRootContext();
const { reference, handlers } = useTriggerBehaviour();

const listeners: [string, EventListener, boolean][] = [
  ["pointermove", handlers.onPointermove as EventListener, false],
  ["pointerleave", handlers.onPointerleave as EventListener, false],
  ["pointerdown", handlers.onPointerdown as EventListener, false],
  ["click", handlers.onClick as EventListener, false],
  ["click", handlers.onClickCapture as EventListener, true],
  ["focusin", handlers.onFocusin as EventListener, false],
  ["focusout", handlers.onFocusout as EventListener, false],
];

let named = false;
let marked = false;

watch(
  () => props.label,
  (label) => {
    if (label && (named || !hasOwnName(props.element))) {
      props.element.setAttribute("aria-label", label);
      named = true;
    } else if (named) {
      props.element.removeAttribute("aria-label");
      named = false;
    }
  },
  { immediate: true },
);

watch(
  () => root.trigger.value,
  (el) => {
    if (el !== props.element) root.onTriggerChange(props.element);
  },
  { flush: "post" },
);

watch(
  () => controller.open.value && controller.role.value === "description",
  (described) => toggleToken(props.element, "aria-describedby", root.contentId, described),
  { flush: "post" },
);

onMounted(() => {
  marked = !props.element.hasAttribute("data-grace-area-trigger");
  props.element.setAttribute("data-grace-area-trigger", "");
  root.onTriggerChange(props.element);
  for (const [type, listener, capture] of listeners) props.element.addEventListener(type, listener, capture);
});

onBeforeUnmount(() => {
  for (const [type, listener, capture] of listeners) props.element.removeEventListener(type, listener, capture);
  toggleToken(props.element, "aria-describedby", root.contentId, false);
  if (named) props.element.removeAttribute("aria-label");
  if (marked) props.element.removeAttribute("data-grace-area-trigger");
});
</script>

<template>
  <TooltipTrigger as-child :reference="reference ?? element" />
</template>
