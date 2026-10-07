<script setup lang="ts">
import { OverlayScrim, injectOverlayPortalTarget, useModalScrim } from "@kappa-ui/core/overlay";
import {
  PopoverContent,
  type PopoverContentEmits,
  type PopoverContentProps,
  PopoverPortal,
  injectPopoverRootContext,
  useForwardPropsEmits,
} from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { focusInitialDay } from "@/ui/calendar";
import { overlaySurface } from "@/ui/popover";
import { datePickerContent } from ".";
import { injectDatePickerContext } from "./picker";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<PopoverContentProps & { class?: HTMLAttributes["class"] }>(), {
  align: "start",
  sideOffset: 4,
  collisionPadding: 8,
});
const emits = defineEmits<PopoverContentEmits>();

defineSlots<{
  /** The calendar, and anything that goes with it: presets, a time field, buttons. */
  default?: () => unknown;
}>();

const delegated = computed(() => {
  const { class: _, ...rest } = props;
  return rest;
});
const forwarded = useForwardPropsEmits(delegated, emits);

const picker = injectDatePickerContext();
const rootContext = injectPopoverRootContext();
const scrim = useModalScrim({
  open: rootContext.open,
  modal: rootContext.modal,
  forceMount: () => props.forceMount,
});
const { ModalScrimHold } = scrim;
const portalTarget = injectOverlayPortalTarget(null);

// Reka's own first focus takes the first selected or today's day in the DOM, which can be a copy in
// a neighbouring month that can't take focus, and then focus never enters the calendar. Focus the
// day Reka's roving tabindex points at instead; with no calendar inside, Reka's default runs.
const onOpenAutoFocus = (event: Event) => {
  const content = event.target instanceof HTMLElement ? event.target : null;
  if (event.defaultPrevented || !content) return;
  focusInitialDay(content);
  if (content.contains(document.activeElement)) event.preventDefault();
};
</script>

<template>
  <PopoverPortal :to="portalTarget ?? undefined">
    <OverlayScrim :scrim="scrim" data-slot="date-picker-scrim" class="z-50" />
    <PopoverContent
      v-bind="{ ...$attrs, ...forwarded }"
      data-slot="date-picker-content"
      :dir="props.dir ?? picker.dir.value"
      :class="cn(overlaySurface, datePickerContent, props.class)"
      @open-auto-focus="onOpenAutoFocus"
      @focusin="picker.focus.onFocusin"
      @focusout="picker.focus.onFocusout"
    >
      <ModalScrimHold />
      <slot />
    </PopoverContent>
  </PopoverPortal>
</template>
