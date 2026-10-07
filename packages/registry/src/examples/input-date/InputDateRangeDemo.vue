<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import type { DateRange } from "reka-ui";
import { computed, shallowRef } from "vue";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";
import { InputDateRange } from "@/ui/input-date";

const trip = shallowRef<DateRange | undefined>({
  start: new CalendarDate(2025, 7, 4),
  end: new CalendarDate(2025, 7, 18),
});

const nights = computed(() => {
  const { start, end } = trip.value ?? {};
  return start && end ? end.compare(start) : undefined;
});
const backwards = computed(() => nights.value !== undefined && nights.value < 0);
</script>

<template>
  <Field :invalid="backwards" class="w-full max-w-sm">
    <FieldLabel>Trip dates</FieldLabel>
    <InputDateRange v-model="trip" />
    <FieldError v-if="backwards" errors="The trip ends before it starts." />
    <FieldDescription v-else>{{ nights === undefined ? "Pick both dates." : `${nights} nights.` }}</FieldDescription>
  </Field>
</template>
