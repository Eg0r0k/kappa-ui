<script setup lang="ts">
import { CalendarDays } from "@lucide/vue";
import type { DateValue } from "reka-ui";
import { shallowRef } from "vue";

import { Button } from "@/ui/button";
import {
  DatePicker,
  DatePickerCalendar,
  DatePickerContent,
  DatePickerTrigger,
  DatePickerValue,
} from "@/ui/date-picker";
import { Field, FieldLabel } from "@/ui/field";

const date = shallowRef<DateValue | undefined>();
</script>

<template>
  <Field class="w-auto">
    <FieldLabel>Publish on</FieldLabel>
    <DatePicker v-model="date" locale="en-US">
      <DatePickerTrigger as-child>
        <Button variant="outline" color="neutral" class="w-56 justify-start">
          <CalendarDays data-icon="inline-start" />
          <DatePickerValue placeholder="Pick a date" />
        </Button>
      </DatePickerTrigger>
      <DatePickerContent>
        <DatePickerCalendar />
      </DatePickerContent>
    </DatePicker>
  </Field>
</template>
