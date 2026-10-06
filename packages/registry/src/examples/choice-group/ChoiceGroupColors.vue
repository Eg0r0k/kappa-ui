<script setup lang="ts">
import { ref } from "vue";

import { Checkbox, CheckboxGroup } from "@/ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/ui/field";
import { Radio, RadioGroup } from "@/ui/radio-group";

const plan = ref("pro");
const regions = ref(["eu"]);

const plans = [
  { value: "free", label: "Free", description: "One project." },
  { value: "pro", label: "Pro", description: "Unlimited projects." },
];
const zones = [
  { value: "eu", label: "Europe" },
  { value: "us", label: "United States" },
  { value: "asia", label: "Asia" },
];
</script>

<template>
  <div class="flex w-full max-w-md flex-col gap-6">
    <RadioGroup v-model="plan" variant="card" orientation="horizontal" color="neutral" aria-label="Plan">
      <Field v-for="option in plans" :key="option.value" orientation="horizontal">
        <Radio :value="option.value" />
        <FieldContent>
          <FieldLabel>{{ option.label }}</FieldLabel>
          <FieldDescription>{{ option.description }}</FieldDescription>
        </FieldContent>
      </Field>
    </RadioGroup>
    <CheckboxGroup v-model="regions" variant="list" color="success" aria-label="Regions">
      <Field v-for="zone in zones" :key="zone.value" orientation="horizontal">
        <Checkbox :value="zone.value" />
        <FieldLabel>{{ zone.label }}</FieldLabel>
      </Field>
    </CheckboxGroup>
  </div>
</template>
