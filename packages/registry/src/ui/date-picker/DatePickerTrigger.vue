<script setup lang="ts">
import { CalendarDays } from "@lucide/vue";
import { PopoverTrigger, type PrimitiveProps, injectPopoverRootContext, useId } from "reka-ui";
import { type HTMLAttributes, computed, onBeforeUnmount, onMounted, ref, useAttrs } from "vue";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/ui/button";
import { datePickerTrigger } from ".";
import { injectDatePickerContext } from "./picker";

const props = defineProps<PrimitiveProps & { class?: HTMLAttributes["class"] }>();

defineSlots<{
  /** The icon, or with `as-child` the button that opens the calendar. */
  default?: () => unknown;
}>();

const picker = injectDatePickerContext();
const attrs = useAttrs();

// Without a field the trigger is the control: it takes the Field's id, so the label points at it,
// and its own text joins the label as its name ("Due date, Oct 6, 2026"). Set before Reka's
// PopoverTrigger picks an id, which also labels the calendar's panel.
const standalone = picker.inputs.value === 0;
const popover = injectPopoverRootContext();
if (standalone) popover.triggerId ||= picker.control.id.value ?? useId(undefined, "date-picker-trigger");

const fieldAttrs = computed(() => {
  if (!standalone) return { "aria-label": attrs["aria-labelledby"] ? undefined : "Open calendar" };
  const { field } = picker.control;
  return {
    "aria-labelledby":
      attrs["aria-label"] || !field?.hasLabel.value ? undefined : `${field.labelId} ${popover.triggerId}`,
    "aria-describedby": picker.control.describedBy.value,
    "aria-invalid": picker.control.invalid.value,
  };
});

const element = ref<{ $el: HTMLElement }>();
onMounted(() => {
  picker.trigger.value = element.value?.$el;
});
onBeforeUnmount(() => {
  if (picker.trigger.value === element.value?.$el) picker.trigger.value = undefined;
});
</script>

<template>
  <PopoverTrigger
    ref="element"
    v-bind="fieldAttrs"
    data-slot="date-picker-trigger"
    :data-color="props.asChild ? undefined : 'neutral'"
    :as="props.as"
    :as-child="props.asChild"
    :disabled="picker.disabled.value"
    :class="
      props.asChild
        ? props.class
        : cn(buttonVariants({ variant: 'ghost', size: null, focusRing: 'inward' }), datePickerTrigger, props.class)
    "
    @focusin="picker.focus.onFocusin"
    @focusout="picker.focus.onFocusout"
  >
    <slot>
      <CalendarDays />
    </slot>
  </PopoverTrigger>
</template>
