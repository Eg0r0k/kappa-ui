<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";

import { Field, FieldLabel } from "@/ui/field";
import { InputDate } from "@/ui/input-date";

const value = new CalendarDate(2025, 3, 14);
const locales = [
  { locale: "en-US", label: "English (US)" },
  { locale: "de-DE", label: "Deutsch" },
  { locale: "ja-JP", label: "日本語" },
];
</script>

<template>
  <div class="grid w-full max-w-xl gap-6 sm:grid-cols-3">
    <Field v-for="item in locales" :key="item.locale">
      <FieldLabel>{{ item.label }}</FieldLabel>
      <InputDate :default-value="value" :locale="item.locale" />
    </Field>
  </div>
</template>
