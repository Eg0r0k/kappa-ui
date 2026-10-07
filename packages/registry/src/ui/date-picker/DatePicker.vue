<script setup lang="ts">
import type { DateValue } from "@internationalized/date";
import type { DatePickerRootProps } from "reka-ui";
import { computed, useAttrs, watch } from "vue";

import { inclusiveMax, toInputValue } from "@/ui/input-date/date-field";
import { Popover } from "@/ui/popover";
import { DatePickerCalendar, DatePickerContent, DatePickerInput } from ".";
import {
  type DatePickerSize,
  type DatePickerVariant,
  defined,
  hasTime,
  PickerNativeInputs,
  nativeGranularity,
  provideDatePickerState,
  useModel,
  usePickerRoot,
  withTime,
} from "./picker";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    DatePickerRootProps & {
      /** The field's look, as on `Input`. A `variant` on `DatePickerInput` wins. */
      variant?: DatePickerVariant;
      /** The field's and the calendar's size, from `xs` to `xl`. A `size` on either part wins for that part. */
      size?: DatePickerSize;
    }
  >(),
  {
    modelValue: undefined,
    defaultValue: undefined,
    placeholder: undefined,
    open: undefined,
    defaultOpen: false,
    modal: false,
    closeOnSelect: undefined,
    preventDeselect: true,
    fixedWeeks: true,
  },
);

const emits = defineEmits<{
  "update:modelValue": [date: DateValue | undefined];
  "update:placeholder": [date: DateValue];
  "update:open": [value: boolean];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}>();

defineSlots<{
  default?: (props: { modelValue: DateValue | undefined; open: boolean }) => unknown;
}>();

const context = usePickerRoot(props, useAttrs(), emits);

const [model, setModel] = useModel<DateValue | undefined>(
  () => props.modelValue ?? undefined,
  props.defaultValue,
  (value) => emits("update:modelValue", value),
);

// The month the calendar shows once it's paged. It starts over from the value on every open,
// unless `v-model:placeholder` holds it.
const [placeholder, setPlaceholder] = useModel<DateValue>(
  () => props.placeholder,
  undefined,
  (value) => emits("update:placeholder", value),
);
// Cleared as it opens, not as it closes: the calendar is still on screen while the panel fades out.
watch(context.open, (open) => {
  if (open && props.placeholder === undefined) placeholder.value = undefined;
});

const timed = computed(() => hasTime(props.granularity, model.value, props.placeholder, props.defaultPlaceholder));
const closeOnSelect = computed(() => props.closeOnSelect ?? !timed.value);

const pick = (value: DateValue | undefined) => {
  setModel(value && withTime(value, model.value, timed.value));
  if (value && closeOnSelect.value) context.setOpen(false);
};

// A day the calendar won't let you pick is invalid in the field too.
const isDateUnavailable = (date: DateValue) => Boolean(props.isDateUnavailable?.(date) || props.isDateDisabled?.(date));
const matchesInField = computed(() =>
  props.isDateUnavailable || props.isDateDisabled ? isDateUnavailable : undefined,
);

const field = computed(() =>
  defined({
    id: props.id,
    name: props.name,
    required: props.required,
    disabled: props.disabled,
    readonly: props.readonly,
    locale: props.locale,
    dir: props.dir,
    granularity: props.granularity,
    hourCycle: props.hourCycle,
    step: props.step,
    stepSnapping: props.stepSnapping,
    hideTimeZone: props.hideTimeZone,
    minValue: props.minValue,
    maxValue: props.maxValue,
    isDateUnavailable: matchesInField.value,
    placeholder: props.placeholder,
    defaultPlaceholder: props.defaultPlaceholder,
  }),
);

const calendar = computed(() =>
  defined({
    locale: props.locale,
    dir: props.dir,
    minValue: props.minValue,
    maxValue: props.maxValue,
    isDateDisabled: props.isDateDisabled,
    isDateUnavailable: props.isDateUnavailable,
    weekStartsOn: props.weekStartsOn,
    weekdayFormat: props.weekdayFormat,
    fixedWeeks: props.fixedWeeks,
    numberOfMonths: props.numberOfMonths,
    pagedNavigation: props.pagedNavigation,
    preventDeselect: props.preventDeselect,
    disabled: context.disabled.value || undefined,
    readonly: props.readonly,
    placeholder: placeholder.value,
    defaultPlaceholder: model.value ? undefined : props.defaultPlaceholder,
  }),
);

provideDatePickerState({ model, setModel, pick, placeholder, setPlaceholder, field, calendar });

const granularity = computed(() => nativeGranularity(timed.value, props.granularity));
const nativeInputs = () => [
  {
    "data-slot": "date-picker-native-input",
    type: granularity.value === "day" ? "date" : "datetime-local",
    step: granularity.value === "second" ? 1 : undefined,
    name: props.name,
    value: toInputValue(model.value, granularity.value),
    min: toInputValue(props.minValue, granularity.value) || undefined,
    max: toInputValue(inclusiveMax(props.maxValue), granularity.value) || undefined,
  },
];
</script>

<template>
  <Popover :open="context.open.value" :modal="props.modal" @update:open="context.setOpen">
    <slot :model-value="model" :open="context.open.value">
      <DatePickerInput v-bind="$attrs" />
      <DatePickerContent>
        <DatePickerCalendar />
      </DatePickerContent>
    </slot>
    <PickerNativeInputs :inputs="nativeInputs" :name="props.name" />
  </Popover>
</template>
