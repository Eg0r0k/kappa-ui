<script setup lang="ts">
import { Form, Field as FormischField, type SubmitHandler, useForm } from "@formisch/vue";
import { CalendarDate, DateFormatter, getLocalTimeZone, parseDate } from "@internationalized/date";
import type { DateValue } from "reka-ui";
import * as v from "valibot";
import { ref } from "vue";

import { Button } from "@/ui/button";
import { Calendar } from "@/ui/calendar";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";

// Fixed so the docs prerender the same page every day; use today(getLocalTimeZone()) in an app.
const latest = new CalendarDate(2008, 10, 6);

const Signup = v.object({
  birthDate: v.pipe(
    v.string(),
    v.nonEmpty("Pick your date of birth."),
    v.check((value) => !value || parseDate(value).compare(latest) <= 0, "You need to be 18 or over."),
  ),
});

const form = useForm({ schema: Signup, initialInput: { birthDate: "" } });
const sent = ref<string>();

// The form keeps an ISO string, so every render parses a new CalendarDate for the same day.
const toDate = (value?: string) => (value ? parseDate(value) : undefined);

const formatter = new DateFormatter("en-US", { dateStyle: "long" });
const submit: SubmitHandler<typeof Signup> = (output) => {
  sent.value = formatter.format(parseDate(output.birthDate).toDate(getLocalTimeZone()));
};
</script>

<template>
  <Form :of="form" class="flex w-full max-w-xs flex-col items-start gap-4" @submit="submit">
    <FormischField v-slot="field" :of="form" :path="['birthDate']">
      <Field :invalid="field.errors !== null">
        <FieldLabel>Date of birth</FieldLabel>
        <Calendar
          :model-value="toDate(field.input)"
          :default-placeholder="new CalendarDate(2000, 1, 1)"
          :max-value="latest"
          class="rounded-xl border border-border p-3"
          @update:model-value="(value?: DateValue) => (field.input = value?.toString() ?? '')"
        />
        <FieldDescription>We only check that you're 18 or over.</FieldDescription>
        <FieldError :errors="field.errors" />
      </Field>
    </FormischField>
    <Button type="submit" size="sm">Sign up</Button>
    <p class="text-body-sm text-muted-foreground" aria-live="polite">{{ sent ? `Born ${sent}.` : "" }}</p>
  </Form>
</template>
