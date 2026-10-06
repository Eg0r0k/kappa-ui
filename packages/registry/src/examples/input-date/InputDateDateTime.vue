<script setup lang="ts">
import { CalendarDateTime } from "@internationalized/date";

import { Field, FieldLabel } from "@/ui/field";
import { InputDate } from "@/ui/input-date";

const departure = new CalendarDateTime(2025, 9, 12, 18, 40);
</script>

<template>
  <div class="grid w-full max-w-xl gap-6 sm:grid-cols-2">
    <Field>
      <FieldLabel>Departure, 24-hour</FieldLabel>
      <InputDate :default-value="departure" granularity="minute" :hour-cycle="24" />
    </Field>
    <Field>
      <FieldLabel>Departure, 12-hour</FieldLabel>
      <InputDate :default-value="departure" granularity="minute" :hour-cycle="12" />
    </Field>
  </div>
</template>
