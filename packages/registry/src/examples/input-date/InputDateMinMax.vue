<script setup lang="ts">
import { getLocalTimeZone, today } from "@internationalized/date";
import type { DateValue } from "reka-ui";
import { computed, shallowRef } from "vue";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";
import { InputDate } from "@/ui/input-date";

const min = today(getLocalTimeZone());
const max = min.add({ days: 90 });
const booking = shallowRef<DateValue | undefined>(min.add({ days: 120 }));

const invalid = computed(
  () => booking.value !== undefined && (booking.value.compare(min) < 0 || booking.value.compare(max) > 0),
);
</script>

<template>
  <Field :invalid="invalid" class="w-full max-w-xs">
    <FieldLabel>Booking date</FieldLabel>
    <InputDate v-model="booking" :min-value="min" :max-value="max" />
    <FieldError v-if="invalid" errors="Bookings open 90 days ahead." />
    <FieldDescription v-else>From today to {{ max.toString() }}.</FieldDescription>
  </Field>
</template>
