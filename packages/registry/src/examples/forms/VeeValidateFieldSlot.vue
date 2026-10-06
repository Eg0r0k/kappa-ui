<script setup lang="ts">
import { type InvalidSubmissionContext, Form as VeeForm, Field as VeeField } from "vee-validate";
import { ref } from "vue";
import * as z from "zod";

import { focusFirstInvalid } from "@/lib/field-context";
import { toTypedSchema } from "@/lib/standard-schema";
import { Button } from "@/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import { InputNumber, InputNumberDecrement, InputNumberIncrement, InputNumberInput } from "@/ui/input-number";

const Booking = toTypedSchema(
  z.object({
    name: z.string().min(2, "Enter the name on the booking."),
    guests: z.number("Enter the number of guests.").min(1, "Book for at least one guest.").max(8, "Up to 8 guests."),
  }),
);

const booked = ref("");

const onInvalid = ({ evt }: InvalidSubmissionContext) => focusFirstInvalid(evt?.target as HTMLFormElement | null);
</script>

<template>
  <VeeForm
    v-slot="{ errors }"
    :validation-schema="Booking"
    :initial-values="{ name: '', guests: 2 }"
    class="flex w-full max-w-xs flex-col items-start gap-4"
    @submit="(values) => (booked = `Table for ${values.guests}, ${values.name}.`)"
    @invalid-submit="onInvalid"
  >
    <FieldGroup>
      <VeeField v-slot="{ componentField }" name="name">
        <Field :invalid="!!errors.name" required>
          <FieldLabel>Name</FieldLabel>
          <Input v-bind="componentField" autocomplete="name" />
          <FieldError :errors="errors.name" />
        </Field>
      </VeeField>
      <VeeField v-slot="{ value, handleChange, handleBlur }" name="guests">
        <Field :invalid="!!errors.guests" required>
          <FieldLabel>Guests</FieldLabel>
          <InputNumber :model-value="value" :min="0" @update:model-value="handleChange">
            <InputNumberDecrement />
            <InputNumberInput @blur="handleBlur" />
            <InputNumberIncrement />
          </InputNumber>
          <FieldDescription>Children count as guests.</FieldDescription>
          <FieldError :errors="errors.guests" />
        </Field>
      </VeeField>
    </FieldGroup>
    <div class="flex items-center gap-3">
      <Button type="submit" size="sm">Book</Button>
      <p class="text-body-sm text-muted-foreground" aria-live="polite">{{ booked }}</p>
    </div>
  </VeeForm>
</template>
