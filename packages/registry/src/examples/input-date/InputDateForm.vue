<script setup lang="ts">
import { Form, Field as FormischField, type SubmitHandler, useForm } from "@formisch/vue";
import { getLocalTimeZone, today } from "@internationalized/date";
import type { DateRange, DateValue } from "reka-ui";
import * as v from "valibot";
import { type ComponentPublicInstance, ref } from "vue";

import { Button } from "@/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/ui/field";
import { InputDate, InputDateRange } from "@/ui/input-date";

const now = today(getLocalTimeZone());

const isDate = (input: unknown): input is DateValue =>
  typeof input === "object" && input !== null && "calendar" in input;

const isRange = (input: unknown): input is DateRange =>
  typeof input === "object" &&
  input !== null &&
  "start" in input &&
  "end" in input &&
  isDate(input.start) &&
  isDate(input.end);

const Booking = v.object({
  stay: v.pipe(
    v.custom<DateRange>(isRange, "Enter your arrival and departure dates."),
    v.check(({ start }) => start!.compare(now) >= 0, "Arrival can't be in the past."),
    v.check(({ start, end }) => end!.compare(start!) > 0, "Departure must come after arrival."),
  ),
  birthDate: v.pipe(
    v.custom<DateValue>(isDate, "Enter your date of birth."),
    v.check((date) => date.add({ years: 18 }).compare(now) <= 0, "The lead guest must be 18 or older."),
  ),
});

const form = useForm({ schema: Booking });
const booked = ref<string>();

// Formisch focuses the first invalid field's element on submit; for a segmented field that is its first segment.
const firstSegment = (control: Element | ComponentPublicInstance | null) =>
  control && "$el" in control ? (control.$el as HTMLElement).querySelector("[role=spinbutton]") : control;

const submit: SubmitHandler<typeof Booking> = ({ stay }) => {
  booked.value = `Booked ${stay.start} to ${stay.end}.`;
};
</script>

<template>
  <Form :of="form" class="flex w-full max-w-sm flex-col items-start gap-6" @submit="submit">
    <FieldGroup>
      <FormischField v-slot="field" :of="form" :path="['stay']">
        <Field :invalid="field.errors !== null">
          <FieldLabel>Arrival and departure</FieldLabel>
          <InputDateRange
            v-model="field.input"
            :name="field.props.name"
            :min-value="now"
            :ref="(control) => field.props.ref(firstSegment(control))"
            @focus="field.props.onFocus"
            @blur="field.props.onBlur"
          />
          <FieldError :errors="field.errors" />
        </Field>
      </FormischField>
      <FormischField v-slot="field" :of="form" :path="['birthDate']">
        <Field :invalid="field.errors !== null">
          <FieldLabel>Lead guest's date of birth</FieldLabel>
          <InputDate
            v-model="field.input"
            :name="field.props.name"
            :ref="(control) => field.props.ref(firstSegment(control))"
            @focus="field.props.onFocus"
            @blur="field.props.onBlur"
          />
          <FieldDescription>We check it at the front desk.</FieldDescription>
          <FieldError :errors="field.errors" />
        </Field>
      </FormischField>
    </FieldGroup>
    <div class="flex items-center gap-4">
      <Button type="submit">Book</Button>
      <p class="text-body-sm text-muted-foreground" aria-live="polite">{{ booked }}</p>
    </div>
  </Form>
</template>
