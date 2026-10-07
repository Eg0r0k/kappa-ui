<script setup lang="ts">
import { CalendarDateTime } from "@internationalized/date";
import type { DateValue } from "reka-ui";
import { ref, shallowRef } from "vue";

import { Button } from "@/ui/button";
import { DatePicker, DatePickerCalendar, DatePickerContent, DatePickerInput } from "@/ui/date-picker";
import { Field, FieldLabel } from "@/ui/field";

const departure = shallowRef<DateValue | undefined>(new CalendarDateTime(2026, 10, 16, 7, 45));
const open = ref(false);
</script>

<template>
  <Field class="w-full max-w-64">
    <FieldLabel>Departure</FieldLabel>
    <!-- With time segments the calendar stays open after a pick, so Done closes it. -->
    <DatePicker v-model="departure" v-model:open="open" granularity="minute" :hour-cycle="24" locale="en-GB">
      <DatePickerInput />
      <DatePickerContent>
        <DatePickerCalendar />
        <div class="mt-3 flex justify-end">
          <Button size="sm" @click="open = false">Done</Button>
        </div>
      </DatePickerContent>
    </DatePicker>
  </Field>
</template>
