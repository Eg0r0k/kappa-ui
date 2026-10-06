<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";

import { Field, FieldDescription, FieldLabel } from "@/ui/field";
import { InputDate } from "@/ui/input-date";

const value = new CalendarDate(2025, 12, 31);
</script>

<template>
  <Field class="w-full max-w-xs">
    <FieldLabel>Party venue</FieldLabel>
    <InputDate :default-value="value" loading />
    <FieldDescription>Checking whether the hall is free…</FieldDescription>
  </Field>
</template>
