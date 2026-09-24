<script setup lang="ts">
import { Field, FieldContent, FieldDescription, FieldLabel, FieldLegend, FieldSet } from "@/ui/field";
import { Radio, RadioGroup } from "@/ui/radio-group";

const shipping = [
  { value: "standard", label: "Standard", description: "Arrives in 4 to 6 working days." },
  { value: "express", label: "Express", description: "Arrives tomorrow if ordered before 2 pm." },
];
</script>

<template>
  <FieldSet class="max-w-sm">
    <FieldLegend>Shipping</FieldLegend>
    <RadioGroup default-value="standard">
      <Field v-for="option in shipping" :key="option.value" orientation="horizontal">
        <Radio :value="option.value" />
        <FieldContent>
          <FieldLabel>{{ option.label }}</FieldLabel>
          <FieldDescription>{{ option.description }}</FieldDescription>
        </FieldContent>
      </Field>
    </RadioGroup>
  </FieldSet>
</template>
