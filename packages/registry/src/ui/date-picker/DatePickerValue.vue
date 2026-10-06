<script setup lang="ts">
import type { DateValue } from "@internationalized/date";
import { Primitive, type PrimitiveProps } from "reka-ui";
import { type HTMLAttributes, computed } from "vue";

import { cn } from "@/lib/utils";
import { datePickerValue } from ".";
import { formatterFor, injectDatePickerContext, injectDatePickerState } from "./picker";

const props = withDefaults(
  defineProps<
    PrimitiveProps & {
      /** The text shown while there is no date. */
      placeholder?: string;
      /** `Intl.DateTimeFormat` options. Defaults to a `medium` date, plus a `short` time when the value has one. */
      format?: Intl.DateTimeFormatOptions;
      class?: HTMLAttributes["class"];
    }
  >(),
  { as: "span" },
);

defineSlots<{
  default?: (props: { value: DateValue | undefined; formatted: string | undefined }) => unknown;
}>();

const picker = injectDatePickerContext();
const state = injectDatePickerState();

const formatted = computed(() => {
  const value = state.model.value;
  if (!value) return undefined;
  const { formatter, toDate } = formatterFor(picker.locale.value, value, props.format);
  return formatter.format(toDate(value));
});
</script>

<template>
  <Primitive
    data-slot="date-picker-value"
    :data-placeholder="formatted ? undefined : ''"
    :as="props.as"
    :as-child="props.asChild"
    :class="cn(datePickerValue, props.class)"
  >
    <slot :value="state.model.value" :formatted="formatted">{{ formatted ?? props.placeholder }}</slot>
  </Primitive>
</template>
