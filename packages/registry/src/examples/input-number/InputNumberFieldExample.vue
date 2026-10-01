<script setup lang="ts">
import { computed, ref } from "vue";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";
import { InputNumber, InputNumberDecrement, InputNumberIncrement, InputNumberInput } from "@/ui/input-number";

const guests = ref<number | undefined>(10);
const invalid = computed(() => guests.value === undefined || guests.value > 8);
</script>

<template>
  <Field :invalid="invalid" required class="w-full max-w-xs">
    <FieldLabel>Guests</FieldLabel>
    <InputNumber v-model="guests" :min="1">
      <InputNumberDecrement />
      <InputNumberInput />
      <InputNumberIncrement />
    </InputNumber>
    <FieldError v-if="invalid" errors="Up to eight guests per booking." />
    <FieldDescription v-else>Children count as guests.</FieldDescription>
  </Field>
</template>
