<script setup lang="ts">
import type { DateValue } from "@internationalized/date";
import type { DateRange, DateRangePickerRootProps } from "reka-ui";
import { computed, useAttrs, watch } from "vue";

import {
  type DatePickerSize,
  type DatePickerVariant,
  PickerNativeInputs,
  defined,
  hasTime,
  nativeGranularity,
  useModel,
  usePickerRoot,
  withTime,
} from "@/ui/date-picker/picker";
import { inclusiveMax, toInputValue } from "@/ui/input-date/date-field";
import { Popover } from "@/ui/popover";
import { DateRangePickerCalendar, DateRangePickerContent, DateRangePickerInput, provideDateRangePickerState } from ".";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    DateRangePickerRootProps & {
      /** The field's look, as on `Input`. A `variant` on `DateRangePickerInput` wins. */
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
    fixedWeeks: true,
  },
);

const emits = defineEmits<{
  "update:modelValue": [range: DateRange];
  "update:placeholder": [date: DateValue];
  "update:startValue": [date: DateValue | undefined];
  "update:open": [value: boolean];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}>();

defineSlots<{
  default?: (props: { modelValue: DateRange | null | undefined; open: boolean }) => unknown;
}>();

const context = usePickerRoot(props, useAttrs(), emits);

const [model, setModel] = useModel<DateRange | null>(
  () => props.modelValue,
  props.defaultValue,
  (value) => emits("update:modelValue", value ?? { start: undefined, end: undefined }),
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

const timed = computed(() =>
  hasTime(props.granularity, model.value?.start, model.value?.end, props.placeholder, props.defaultPlaceholder),
);
const closeOnSelect = computed(() => props.closeOnSelect ?? !timed.value);

// Days picked in the calendar keep the times typed into the field.
const pick = (value: DateRange) => {
  const current = model.value;
  setModel({
    start: value.start && withTime(value.start, current?.start, timed.value),
    end: value.end && withTime(value.end, current?.end, timed.value),
  });
};
const complete = () => {
  if (closeOnSelect.value) context.setOpen(false);
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
    isDateHighlightable: props.isDateHighlightable,
    allowNonContiguousRanges: props.allowNonContiguousRanges,
    fixedDate: props.fixedDate,
    maximumDays: props.maximumDays,
    weekStartsOn: props.weekStartsOn,
    weekdayFormat: props.weekdayFormat,
    fixedWeeks: props.fixedWeeks,
    numberOfMonths: props.numberOfMonths,
    pagedNavigation: props.pagedNavigation,
    preventDeselect: props.preventDeselect,
    disabled: context.disabled.value || undefined,
    readonly: props.readonly,
    placeholder: placeholder.value,
    defaultPlaceholder: model.value?.start ? undefined : props.defaultPlaceholder,
  }),
);

provideDateRangePickerState({
  model,
  setModel,
  pick,
  complete,
  placeholder,
  setPlaceholder,
  setStart: (value) => emits("update:startValue", value),
  field,
  calendar,
});

// As InputDateRange does, the form gets `name[start]` and `name[end]`.
const granularity = computed(() => nativeGranularity(timed.value, props.granularity));
const nativeInputs = () =>
  (["start", "end"] as const).map((side) => ({
    "data-slot": "date-range-picker-native-input",
    type: granularity.value === "day" ? "date" : "datetime-local",
    step: granularity.value === "second" ? 1 : undefined,
    name: props.name ? `${props.name}[${side}]` : undefined,
    value: toInputValue(model.value?.[side], granularity.value),
    min: toInputValue(props.minValue, granularity.value) || undefined,
    max: toInputValue(inclusiveMax(props.maxValue), granularity.value) || undefined,
  }));
</script>

<template>
  <Popover :open="context.open.value" :modal="props.modal" @update:open="context.setOpen">
    <slot :model-value="model" :open="context.open.value">
      <DateRangePickerInput v-bind="$attrs" />
      <DateRangePickerContent>
        <DateRangePickerCalendar />
      </DateRangePickerContent>
    </slot>
    <PickerNativeInputs :inputs="nativeInputs" :name="props.name" />
  </Popover>
</template>
