<script setup lang="ts">
import { Field, FieldLabel } from "@/ui/field";
import { Radio, RadioGroup } from "@/ui/radio-group";
</script>

<template>
  <RadioGroup default-value="comfortable" aria-label="Density">
    <Field v-for="option in ['Default', 'Comfortable', 'Compact']" :key="option" orientation="horizontal">
      <Radio :value="option.toLowerCase()" />
      <FieldLabel>{{ option }}</FieldLabel>
    </Field>
  </RadioGroup>
</template>
