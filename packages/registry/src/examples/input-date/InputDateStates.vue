<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";

import { Field, FieldDescription, FieldLabel } from "@/ui/field";
import { InputDate } from "@/ui/input-date";

const value = new CalendarDate(2025, 3, 14);
</script>

<template>
  <div class="grid w-full max-w-md gap-6 sm:grid-cols-2">
    <Field disabled>
      <FieldLabel>Disabled</FieldLabel>
      <InputDate :default-value="value" />
    </Field>
    <Field>
      <FieldLabel>Read only</FieldLabel>
      <InputDate :default-value="value" readonly />
      <FieldDescription>Focusable, not editable.</FieldDescription>
    </Field>
  </div>
</template>
