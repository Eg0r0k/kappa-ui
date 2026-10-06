<script setup lang="ts">
import { CalendarDate, isWeekend } from "@internationalized/date";
import { type DateValue, useLocale } from "reka-ui";
import { computed, shallowRef } from "vue";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";
import { InputDate } from "@/ui/input-date";

const locale = useLocale();
const closed = (date: DateValue) => isWeekend(date, locale.value);
const delivery = shallowRef<DateValue | undefined>(new CalendarDate(2025, 11, 22));
const invalid = computed(() => delivery.value !== undefined && closed(delivery.value));
</script>

<template>
  <Field :invalid="invalid" class="w-full max-w-xs">
    <FieldLabel>Delivery day</FieldLabel>
    <InputDate v-model="delivery" :is-date-unavailable="closed" />
    <FieldError v-if="invalid" errors="We don't deliver at weekends." />
    <FieldDescription v-else>Monday to Friday.</FieldDescription>
  </Field>
</template>
