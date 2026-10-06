<script setup lang="ts">
import { useForm } from "vee-validate";
import { useTemplateRef } from "vue";
import * as z from "zod";

import { focusFirstInvalid } from "@/lib/field-context";
import { toTypedSchema } from "@/lib/standard-schema";
import { Button } from "@/ui/button";
import { Checkbox, CheckboxGroup } from "@/ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/ui/field";
import { Radio, RadioGroup } from "@/ui/radio-group";
import { Switch } from "@/ui/switch";

const channels = [
  { value: "push", label: "Push notifications" },
  { value: "email", label: "Email notifications" },
];

const plans = [
  { value: "starter", label: "Starter", description: "For individuals." },
  { value: "pro", label: "Pro", description: "For small teams." },
];

const Preferences = z.object({
  channels: z.array(z.string()).min(1, "Pick at least one way to be notified."),
  plan: z.enum(["starter", "pro"], "Choose a plan."),
  twoFactor: z.boolean().refine((on) => on, "Turn on two-factor authentication to continue."),
});

const { defineField, errors, handleSubmit } = useForm({
  validationSchema: toTypedSchema(Preferences),
  initialValues: { channels: [], twoFactor: false },
});

const [selected] = defineField("channels");
const [plan] = defineField("plan");
const [twoFactor] = defineField("twoFactor");

const form = useTemplateRef("form");

const submit = handleSubmit(
  () => {},
  () => focusFirstInvalid(form.value),
);
</script>

<template>
  <form ref="form" novalidate class="flex w-full max-w-md flex-col items-start gap-8" @submit="submit">
    <FieldSet :invalid="!!errors.channels">
      <FieldLegend>Notifications</FieldLegend>
      <CheckboxGroup v-model="selected">
        <Field v-for="channel in channels" :key="channel.value" orientation="horizontal">
          <Checkbox :value="channel.value" />
          <FieldLabel>{{ channel.label }}</FieldLabel>
        </Field>
      </CheckboxGroup>
      <FieldError :errors="errors.channels" />
    </FieldSet>

    <FieldSet :invalid="!!errors.plan" class="w-full">
      <FieldLegend>Plan</FieldLegend>
      <RadioGroup v-model="plan" variant="card" orientation="horizontal">
        <Field v-for="item in plans" :key="item.value" orientation="horizontal">
          <Radio :value="item.value" />
          <FieldContent>
            <FieldLabel>{{ item.label }}</FieldLabel>
            <FieldDescription>{{ item.description }}</FieldDescription>
          </FieldContent>
        </Field>
      </RadioGroup>
      <FieldError :errors="errors.plan" />
    </FieldSet>

    <Field orientation="horizontal" :invalid="!!errors.twoFactor">
      <FieldContent>
        <FieldLabel>Two-factor authentication</FieldLabel>
        <FieldDescription>Ask for a code from your phone when you sign in.</FieldDescription>
        <FieldError :errors="errors.twoFactor" />
      </FieldContent>
      <Switch v-model="twoFactor" />
    </Field>

    <Button type="submit" size="sm">Save preferences</Button>
  </form>
</template>
