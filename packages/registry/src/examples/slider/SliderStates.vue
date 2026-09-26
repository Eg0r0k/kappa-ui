<script setup lang="ts">
import { computed, ref } from "vue";

import { Field, FieldError, FieldLabel } from "@/ui/field";
import { Slider } from "@/ui/slider";

const budget = ref(85);
const overBudget = computed(() => budget.value > 80);
</script>

<template>
  <div class="flex w-full max-w-xs flex-col gap-6">
    <Field disabled>
      <FieldLabel>Disabled</FieldLabel>
      <Slider :default-value="[25, 60]" />
    </Field>
    <Field :invalid="overBudget">
      <FieldLabel>Budget</FieldLabel>
      <Slider v-model="budget" />
      <FieldError v-if="overBudget" errors="Keep the budget under 80%." />
    </Field>
  </div>
</template>
