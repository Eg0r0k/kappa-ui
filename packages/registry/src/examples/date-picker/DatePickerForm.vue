<script setup lang="ts">
import { Form, Field as FormischField, type SubmitHandler, useForm } from "@formisch/vue";
import { CalendarDate, DateFormatter, getLocalTimeZone, isWeekend, parseDate } from "@internationalized/date";
import type { DateValue } from "reka-ui";
import * as v from "valibot";
import { type ComponentPublicInstance, ref } from "vue";

import { Button } from "@/ui/button";
import { DatePicker, DatePickerCalendar, DatePickerContent, DatePickerInput } from "@/ui/date-picker";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";

// Fixed so the docs prerender the same page every day; use today(getLocalTimeZone()) in an app.
const now = new CalendarDate(2026, 10, 6);

// Valibot runs every check even after one fails, so the date ones skip an empty string.
const dated = (test: (date: DateValue) => boolean) => (value: string) => !value || test(parseDate(value));

// The form keeps an ISO string, which is what goes to the server.
const Delivery = v.object({
  date: v.pipe(
    v.string(),
    v.nonEmpty("Pick a delivery date."),
    v.check(
      dated((date) => date.compare(now) > 0),
      "Delivery starts tomorrow.",
    ),
    v.check(
      dated((date) => !isWeekend(date, "en-US")),
      "We don't deliver at weekends.",
    ),
  ),
});

// Checked when focus leaves the picker: the field, its button and the calendar count as one control.
const form = useForm({ schema: Delivery, initialInput: { date: "" }, validate: "blur", revalidate: "input" });
const booked = ref<string>();

// Parsed only when the string changes; a new object on every render would be a new value each time.
const parsed = new Map<string, DateValue>();
const toDate = (value?: string) => {
  if (!value) return undefined;
  if (!parsed.has(value)) parsed.set(value, parseDate(value));
  return parsed.get(value);
};

// Formisch focuses the first invalid field's element on submit: here, the first segment.
const firstSegment = (control: Element | ComponentPublicInstance | null) =>
  control && "$el" in control ? (control.$el as HTMLElement).querySelector("[role=spinbutton]") : control;

const formatter = new DateFormatter("en-US", { dateStyle: "full" });
const submit: SubmitHandler<typeof Delivery> = ({ date }) => {
  booked.value = `Booked for ${formatter.format(parseDate(date).toDate(getLocalTimeZone()))}.`;
};
</script>

<template>
  <Form :of="form" class="flex w-full max-w-60 flex-col items-start gap-4" @submit="submit">
    <FormischField v-slot="field" :of="form" :path="['date']">
      <Field :invalid="field.errors !== null">
        <FieldLabel>Delivery date</FieldLabel>
        <DatePicker
          :model-value="toDate(field.input)"
          :name="field.props.name"
          :min-value="now.add({ days: 1 })"
          :is-date-disabled="(date: DateValue) => isWeekend(date, 'en-US')"
          locale="en-US"
          @update:model-value="(value?: DateValue) => (field.input = value?.toString() ?? '')"
          @focus="field.props.onFocus"
          @blur="field.props.onBlur"
        >
          <DatePickerInput :ref="(control) => field.props.ref(firstSegment(control))" />
          <DatePickerContent>
            <DatePickerCalendar />
          </DatePickerContent>
        </DatePicker>
        <FieldDescription>Weekdays only.</FieldDescription>
        <FieldError :errors="field.errors" />
      </Field>
    </FormischField>
    <Button type="submit" size="sm">Book delivery</Button>
    <p class="text-body-sm text-muted-foreground" aria-live="polite">{{ booked }}</p>
  </Form>
</template>
