<script setup lang="ts">
import { type DateRange, Primitive, type PrimitiveProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { datePickerValue } from "@/ui/date-picker";
import { formatterFor, injectDatePickerContext } from "@/ui/date-picker/picker";
import { injectDateRangePickerState } from ".";

const props = withDefaults(
  defineProps<
    PrimitiveProps & {
      /** The text shown while there is no start date. */
      placeholder?: string;
      /** `Intl.DateTimeFormat` options. Defaults to `medium` dates, plus `short` times when the values have them. */
      format?: Intl.DateTimeFormatOptions;
      class?: HTMLAttributes["class"];
    }
  >(),
  { as: "span" },
);

defineSlots<{
  default?: (props: { value: DateRange | null | undefined; formatted: string | undefined }) => unknown;
}>();

const picker = injectDatePickerContext();
const state = injectDateRangePickerState();

// formatRange drops what both ends share: "Oct 6 – 12, 2026".
const formatted = computed(() => {
  const { start, end } = state.model.value ?? {};
  if (!start) return undefined;
  const { formatter, toDate } = formatterFor(picker.locale.value, start, props.format);
  return end ? formatter.formatRange(toDate(start), toDate(end)) : `${formatter.format(toDate(start))} –`;
});
</script>

<template>
  <Primitive
    data-slot="date-range-picker-value"
    :data-placeholder="formatted ? undefined : ''"
    :as="props.as"
    :as-child="props.asChild"
    :class="cn(datePickerValue, props.class)"
  >
    <slot :value="state.model.value" :formatted="formatted">{{ formatted ?? props.placeholder }}</slot>
  </Primitive>
</template>
