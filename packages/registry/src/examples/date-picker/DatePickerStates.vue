<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";

import { Button } from "@/ui/button";
import { DatePicker } from "@/ui/date-picker";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";

const value = new CalendarDate(2026, 10, 6);
</script>

<template>
  <div class="grid w-full max-w-xl gap-6 sm:grid-cols-2">
    <Field disabled>
      <FieldLabel>Disabled</FieldLabel>
      <DatePicker :default-value="value" locale="en-US" />
    </Field>
    <Field>
      <FieldLabel>Read only</FieldLabel>
      <DatePicker :default-value="value" readonly locale="en-US" />
      <FieldDescription>The calendar opens, but nothing changes.</FieldDescription>
    </Field>
    <Field invalid>
      <FieldLabel>Invalid</FieldLabel>
      <DatePicker :default-value="value" locale="en-US" />
      <FieldError>That day is already taken.</FieldError>
    </Field>
    <form class="flex flex-col gap-3" @submit.prevent>
      <Field required>
        <FieldLabel>Required</FieldLabel>
        <DatePicker name="start" locale="en-US" />
        <FieldDescription>Submit while empty to see the browser's check.</FieldDescription>
      </Field>
      <Button type="submit" size="sm" variant="outline" color="neutral" class="self-start">Submit</Button>
    </form>
  </div>
</template>
