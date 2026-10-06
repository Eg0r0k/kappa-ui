<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { useMediaQuery } from "@vueuse/core";
import type { DateRange } from "reka-ui";
import { computed, shallowRef } from "vue";

import { DateRangePicker } from "@/ui/date-range-picker";
import { Field, FieldDescription, FieldLabel } from "@/ui/field";

const trip = shallowRef<DateRange | null>({
  start: new CalendarDate(2026, 10, 23),
  end: new CalendarDate(2026, 11, 2),
});

// Two months side by side where they fit, one on a phone.
const wide = useMediaQuery("(min-width: 640px)");
const months = computed(() => (wide.value ? 2 : 1));
</script>

<template>
  <Field class="w-full max-w-80">
    <FieldLabel>Trip</FieldLabel>
    <DateRangePicker v-model="trip" :number-of-months="months" locale="en-US" />
    <FieldDescription>Pick the first day, then the last.</FieldDescription>
  </Field>
</template>
