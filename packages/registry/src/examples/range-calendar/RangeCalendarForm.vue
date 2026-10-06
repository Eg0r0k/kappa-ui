<script setup lang="ts">
import { Form, Field as FormischField, type SubmitHandler, useForm } from "@formisch/vue";
import { CalendarDate, DateFormatter, getLocalTimeZone, parseDate } from "@internationalized/date";
import type { DateRange } from "reka-ui";
import * as v from "valibot";
import { ref } from "vue";

import { Button } from "@/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";
import { RangeCalendar } from "@/ui/range-calendar";

const Booking = v.pipe(
  v.object({
    checkIn: v.pipe(v.string(), v.nonEmpty("Pick a check-in date.")),
    checkOut: v.pipe(v.string(), v.nonEmpty("Pick a check-out date.")),
  }),
  v.forward(
    v.check(({ checkIn, checkOut }) => !checkIn || !checkOut || checkOut > checkIn, "Stay at least one night."),
    ["checkOut"],
  ),
);

const form = useForm({ schema: Booking, initialInput: { checkIn: "", checkOut: "" } });
const sent = ref<string>();

// The form keeps ISO strings. While the guest picks, the range has a start and no end yet.
const toRange = (checkIn?: string, checkOut?: string): DateRange => ({
  start: checkIn ? parseDate(checkIn) : undefined,
  end: checkOut ? parseDate(checkOut) : undefined,
});

const formatter = new DateFormatter("en-US", { month: "short", day: "numeric" });
const submit: SubmitHandler<typeof Booking> = ({ checkIn, checkOut }) => {
  sent.value = formatter.formatRange(
    parseDate(checkIn).toDate(getLocalTimeZone()),
    parseDate(checkOut).toDate(getLocalTimeZone()),
  );
};
</script>

<template>
  <Form :of="form" class="flex w-full max-w-xs flex-col items-start gap-4" @submit="submit">
    <FormischField v-slot="checkIn" :of="form" :path="['checkIn']">
      <FormischField v-slot="checkOut" :of="form" :path="['checkOut']">
        <Field :invalid="checkIn.errors !== null || checkOut.errors !== null">
          <FieldLabel>Your stay</FieldLabel>
          <RangeCalendar
            :model-value="toRange(checkIn.input, checkOut.input)"
            :default-placeholder="new CalendarDate(2026, 10, 1)"
            :min-value="new CalendarDate(2026, 10, 6)"
            class="rounded-xl border border-border p-3"
            @update:model-value="
              (range: DateRange) => {
                checkIn.input = range.start?.toString() ?? '';
                checkOut.input = range.end?.toString() ?? '';
              }
            "
          />
          <FieldDescription>Check-in from 3 pm, check-out by 11 am.</FieldDescription>
          <FieldError :errors="checkIn.errors ?? checkOut.errors" />
        </Field>
      </FormischField>
    </FormischField>
    <Button type="submit" size="sm">Book</Button>
    <p class="text-body-sm text-muted-foreground" aria-live="polite">{{ sent ? `Booked ${sent}.` : "" }}</p>
  </Form>
</template>
