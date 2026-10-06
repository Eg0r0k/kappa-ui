<script setup lang="ts">
import { useForm } from "vee-validate";
import { ref, useTemplateRef } from "vue";
import * as z from "zod";

import { focusFirstInvalid } from "@/lib/field-context";
import { toTypedSchema } from "@/lib/standard-schema";
import { Button } from "@/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/ui/field";
import { InputNumber, InputNumberDecrement, InputNumberIncrement, InputNumberInput } from "@/ui/input-number";
import { PinInput, PinInputGroup, PinInputSeparator, PinInputSlot } from "@/ui/pin-input";
import { Slider } from "@/ui/slider";
import { TagsInput, TagsInputInput, TagsInputItem, TagsInputItemDelete, TagsInputItemText } from "@/ui/tags-input";

const isEmail = (value: string) => z.email().safeParse(value).success;

const GiftCards = z.object({
  amount: z.number("Enter how many cards to send.").min(1, "Send at least one card.").max(20, "Send 20 cards at most."),
  recipients: z
    .array(z.string())
    .min(1, "Add at least one recipient.")
    .max(5, "Send to 5 people at most.")
    .refine((list) => list.every(isEmail), "Every recipient needs a valid email address."),
  value: z
    .array(z.number())
    .refine(([low = 0, high = 0]) => high - low >= 20, "Leave at least $20 between the two values."),
  code: z
    .array(z.string())
    .transform((digits) => digits.join(""))
    .pipe(z.string().regex(/^\d{6}$/, "Enter the six digits we emailed you.")),
});

const { defineField, errors, handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(GiftCards),
  initialValues: { amount: 1, recipients: [], value: [20, 100], code: [] },
});

// Each control takes its value with v-model and validates when it changes. The
// code waits for the submit, then checks every digit once it's wrong.
const [amount] = defineField("amount");
const [recipients] = defineField("recipients");
const [value] = defineField("value");
const [code] = defineField("code", (state) => ({ validateOnModelUpdate: state.errors.length > 0 }));

const form = useTemplateRef("form");
const sent = ref("");

const submit = handleSubmit(
  (order) => {
    sent.value = `Sent ${order.amount} × $${order.value[0]}–${order.value[1]}, code ${order.code}`;
  },
  () => focusFirstInvalid(form.value),
);
</script>

<template>
  <form ref="form" novalidate class="flex w-full max-w-sm flex-col items-start gap-6" @submit="submit">
    <FieldGroup>
      <Field :invalid="!!errors.amount" required>
        <FieldLabel>Cards</FieldLabel>
        <InputNumber v-model="amount" :min="0">
          <InputNumberDecrement />
          <InputNumberInput />
          <InputNumberIncrement />
        </InputNumber>
        <FieldError :errors="errors.amount" />
      </Field>
      <Field :invalid="!!errors.recipients" required>
        <FieldLabel>Recipients</FieldLabel>
        <TagsInput v-model="recipients" add-on-blur>
          <TagsInputItem v-for="recipient in recipients" :key="recipient" :value="recipient">
            <TagsInputItemText />
            <TagsInputItemDelete />
          </TagsInputItem>
          <TagsInputInput placeholder="name@example.com" />
        </TagsInput>
        <FieldDescription>Press Enter after each address.</FieldDescription>
        <FieldError :errors="errors.recipients" />
      </Field>
      <Field :invalid="!!errors.value">
        <div class="flex items-center justify-between">
          <FieldLabel>Card value</FieldLabel>
          <span class="text-body-sm text-muted-foreground tabular-nums">${{ value[0] }} – ${{ value[1] }}</span>
        </div>
        <Slider v-model="value" :min="10" :max="200" :step="10" />
        <FieldError :errors="errors.value" />
      </Field>
      <Field :invalid="!!errors.code" required class="w-fit">
        <FieldLabel>Confirmation code</FieldLabel>
        <PinInput v-model="code">
          <PinInputGroup>
            <PinInputSlot v-for="index in [0, 1, 2]" :key="index" :index="index" />
          </PinInputGroup>
          <PinInputSeparator />
          <PinInputGroup>
            <PinInputSlot v-for="index in [3, 4, 5]" :key="index" :index="index" />
          </PinInputGroup>
        </PinInput>
        <FieldError :errors="errors.code" />
      </Field>
    </FieldGroup>
    <div class="flex gap-2">
      <Button type="button" variant="outline" color="neutral" size="sm" @click="resetForm()">Reset</Button>
      <Button type="submit" size="sm">Send gift cards</Button>
    </div>
    <p class="text-body-sm text-muted-foreground" aria-live="polite">{{ sent }}</p>
  </form>
</template>
