<script setup lang="ts">
import { Field, FieldLabel } from "@/ui/field";
import { Radio, RadioGroup } from "@/ui/radio-group";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <RadioGroup default-value="comfortable" aria-label="Density">
    <Field v-for="option in ['Default', 'Comfortable', 'Compact']" :key="option" orientation="horizontal">
      <Radio :value="option.toLowerCase()" v-bind="$attrs" />
      <FieldLabel>{{ option }}</FieldLabel>
    </Field>
  </RadioGroup>
</template>
