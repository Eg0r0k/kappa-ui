<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import type { DateValue } from "reka-ui";
import { shallowRef } from "vue";

import { DatePicker } from "@/ui/date-picker";
import { Field, FieldDescription, FieldLabel } from "@/ui/field";

const due = shallowRef<DateValue | undefined>(new CalendarDate(2026, 10, 30));
</script>

<template>
  <Field class="w-full max-w-60">
    <FieldLabel>Invoice due</FieldLabel>
    <DatePicker v-model="due" locale="en-US" />
    <FieldDescription>Type the date or pick it from the calendar.</FieldDescription>
  </Field>
</template>
