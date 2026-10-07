<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import { ConfigProvider } from "reka-ui";

import { DatePicker } from "@/ui/date-picker";
import { Field, FieldLabel } from "@/ui/field";

const value = new CalendarDate(2026, 10, 6);
</script>

<template>
  <div class="grid w-full max-w-lg gap-6 sm:grid-cols-2">
    <Field>
      <FieldLabel>Lieferdatum</FieldLabel>
      <DatePicker :default-value="value" locale="de-DE" />
    </Field>
    <!-- ConfigProvider sets the locale and the direction for everything inside. -->
    <ConfigProvider locale="ar-EG" dir="rtl">
      <Field dir="rtl">
        <FieldLabel>تاريخ التسليم</FieldLabel>
        <DatePicker :default-value="value" />
      </Field>
    </ConfigProvider>
  </div>
</template>
