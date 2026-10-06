<script setup lang="ts">
import { PopoverAnchor } from "reka-ui";
import { type HTMLAttributes, computed, onBeforeUnmount, watchEffect } from "vue";

import { cn } from "@/lib/utils";
import { InputDateRange } from "@/ui/input-date";
import { injectInputGroupContext, inputGroupVariants, provideInputGroupContext } from "@/ui/input-group";
import { datePickerInputVariants } from "@/ui/date-picker";
import { type DatePickerSize, type DatePickerVariant, injectDatePickerContext } from "@/ui/date-picker/picker";
import { DateRangePickerTrigger, injectDateRangePickerState } from ".";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  /** The text control look, as on `Input`. Defaults to the root's, then `outline`. */
  variant?: DatePickerVariant;
  /** The field's height, from 28px at `xs` to 48px at `xl`. Defaults to the root's, then `md`. */
  size?: DatePickerSize;
  class?: HTMLAttributes["class"];
}>();

defineSlots<{
  /** What follows the segments. Defaults to `DateRangePickerTrigger`. */
  default?: () => unknown;
}>();

const picker = injectDatePickerContext();
const state = injectDateRangePickerState();

// In an input group the field takes the group's frame; on its own it draws the same frame itself,
// so the segments, the trigger and the frame's focus ring work the same either way.
const group = injectInputGroupContext(null);
const variant = computed(() => group?.variant.value ?? props.variant ?? picker.variant.value ?? "outline");
const size = computed(() => group?.size.value ?? props.size ?? picker.size.value ?? "md");
if (!group) provideInputGroupContext({ variant, size });

picker.inputs.value += 1;
onBeforeUnmount(() => {
  picker.inputs.value -= 1;
});
watchEffect(() => {
  picker.inputSize.value = size.value;
});

const dataState = computed(() => (picker.open.value ? "open" : "closed"));

// Alt+ArrowDown opens the calendar from a segment, as on a native date input. Captured, so the
// segment doesn't step down as well.
const onKeydownCapture = (event: KeyboardEvent) => {
  if (!event.altKey || event.key !== "ArrowDown" || picker.disabled.value) return;
  event.preventDefault();
  event.stopPropagation();
  picker.setOpen(true);
};
</script>

<template>
  <PopoverAnchor v-if="!group" as-child>
    <div
      data-slot="date-range-picker-input"
      :data-variant="variant"
      :data-size="size"
      :data-state="dataState"
      :data-disabled="picker.disabled.value || undefined"
      :class="cn(inputGroupVariants({ variant, size }), datePickerInputVariants({ variant }), props.class)"
      @focusin="picker.focus.onFocusin"
      @focusout="picker.focus.onFocusout"
      @keydown.capture="onKeydownCapture"
    >
      <InputDateRange
        v-bind="{ ...$attrs, ...state.field.value }"
        :model-value="state.model.value"
        @update:model-value="state.setModel"
      />
      <slot>
        <DateRangePickerTrigger />
      </slot>
    </div>
  </PopoverAnchor>
  <template v-else>
    <PopoverAnchor as-child>
      <InputDateRange
        v-bind="{ ...$attrs, ...state.field.value }"
        :model-value="state.model.value"
        :data-state="dataState"
        :class="props.class"
        @update:model-value="state.setModel"
        @focusin="picker.focus.onFocusin"
        @focusout="picker.focus.onFocusout"
        @keydown.capture="onKeydownCapture"
      />
    </PopoverAnchor>
    <slot>
      <DateRangePickerTrigger />
    </slot>
  </template>
</template>
