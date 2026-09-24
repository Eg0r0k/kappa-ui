<script setup lang="ts">
import { Form, Field as FormischField, useForm } from "@formisch/vue";
import * as v from "valibot";

import { Button } from "@/ui/button";
import { Checkbox, CheckboxGroup } from "@/ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/ui/field";
import { Radio, RadioGroup } from "@/ui/radio-group";
import { Switch } from "@/ui/switch";

const tasks = [
  { value: "push", label: "Push notifications" },
  { value: "email", label: "Email notifications" },
];

const plans = [
  { value: "starter", label: "Starter", description: "For individuals." },
  { value: "pro", label: "Pro", description: "For small teams." },
];

const Preferences = v.object({
  tasks: v.pipe(v.array(v.string()), v.minLength(1, "Pick at least one way to be notified.")),
  plan: v.picklist(["starter", "pro"], "Choose a plan."),
  twoFactor: v.pipe(v.boolean(), v.value(true, "Turn on two-factor authentication to continue.")),
});

const form = useForm({ schema: Preferences, initialInput: { tasks: [], twoFactor: false } });
</script>

<template>
  <Form :of="form" class="flex w-full max-w-md flex-col items-start gap-8" @submit="() => {}">
    <FormischField v-slot="field" :of="form" :path="['tasks']">
      <FieldSet :invalid="field.errors !== null">
        <FieldLegend>Notifications</FieldLegend>
        <CheckboxGroup v-model="field.input">
          <Field v-for="task in tasks" :key="task.value" orientation="horizontal">
            <Checkbox :value="task.value" />
            <FieldLabel>{{ task.label }}</FieldLabel>
          </Field>
        </CheckboxGroup>
        <FieldError :errors="field.errors" />
      </FieldSet>
    </FormischField>

    <FormischField v-slot="field" :of="form" :path="['plan']">
      <FieldSet :invalid="field.errors !== null" class="w-full">
        <FieldLegend>Plan</FieldLegend>
        <RadioGroup v-model="field.input" variant="card" orientation="horizontal">
          <Field v-for="plan in plans" :key="plan.value" orientation="horizontal">
            <Radio :value="plan.value" />
            <FieldContent>
              <FieldLabel>{{ plan.label }}</FieldLabel>
              <FieldDescription>{{ plan.description }}</FieldDescription>
            </FieldContent>
          </Field>
        </RadioGroup>
        <FieldError :errors="field.errors" />
      </FieldSet>
    </FormischField>

    <FormischField v-slot="field" :of="form" :path="['twoFactor']">
      <Field orientation="horizontal" :invalid="field.errors !== null">
        <FieldContent>
          <FieldLabel>Two-factor authentication</FieldLabel>
          <FieldDescription>Ask for a code from your phone when you sign in.</FieldDescription>
          <FieldError :errors="field.errors" />
        </FieldContent>
        <Switch v-model="field.input" />
      </Field>
    </FormischField>

    <Button type="submit" size="sm">Save preferences</Button>
  </Form>
</template>
