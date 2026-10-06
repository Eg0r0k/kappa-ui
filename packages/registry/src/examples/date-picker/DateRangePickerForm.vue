<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";
import type { DateValue } from "reka-ui";
import { ref } from "vue";

import { Button } from "@/ui/button";
import { DateRangePicker } from "@/ui/date-range-picker";
import { Field, FieldDescription, FieldLabel } from "@/ui/field";

// Fixed so the docs prerender the same page every day; use today(getLocalTimeZone()) in an app.
const now = new CalendarDate(2026, 10, 6);
const soldOut = ["2026-10-16", "2026-10-17", "2026-10-31"];
const isSoldOut = (date: DateValue) => soldOut.includes(date.toString());

const sent = ref<string>();

// A plain form: the picker submits `stay[start]` and `stay[end]` as ISO dates.
const submit = (event: SubmitEvent) => {
  const data = new FormData(event.target as HTMLFormElement);
  sent.value = `Checking ${data.get("stay[start]")} to ${data.get("stay[end]")}…`;
};
</script>

<template>
  <form class="flex w-full max-w-80 flex-col items-start gap-4" @submit.prevent="submit">
    <Field required>
      <FieldLabel>Check-in and check-out</FieldLabel>
      <DateRangePicker
        name="stay"
        :min-value="now"
        :maximum-days="14"
        :is-date-unavailable="isSoldOut"
        :number-of-months="2"
        locale="en-US"
      />
      <FieldDescription>Up to two weeks. Struck-through nights are sold out.</FieldDescription>
    </Field>
    <Button type="submit" size="sm">Check availability</Button>
    <p class="text-body-sm text-muted-foreground" aria-live="polite">{{ sent }}</p>
  </form>
</template>
