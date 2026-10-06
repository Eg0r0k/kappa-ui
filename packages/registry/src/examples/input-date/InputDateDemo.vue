<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import type { DateValue } from "reka-ui";
import { shallowRef } from "vue";

import { Field, FieldDescription, FieldLabel } from "@/ui/field";
import { InputDate } from "@/ui/input-date";

const birthday = shallowRef<DateValue | undefined>(new CalendarDate(1990, 6, 21));
</script>

<template>
  <Field class="w-full max-w-xs">
    <FieldLabel>Date of birth</FieldLabel>
    <InputDate v-model="birthday" />
    <FieldDescription>Selected: {{ birthday?.toString() ?? "none" }}</FieldDescription>
  </Field>
</template>
