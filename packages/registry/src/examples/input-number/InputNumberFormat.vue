<script setup lang="ts">
import { ref } from "vue";

import { Field, FieldDescription, FieldLabel } from "@/ui/field";
import { InputNumber, InputNumberDecrement, InputNumberIncrement, InputNumberInput } from "@/ui/input-number";

const weight = ref(2.5);
const share = ref(0.25);
const price = ref(1250);
</script>

<template>
  <div class="grid w-full max-w-xl gap-6 sm:grid-cols-3">
    <Field>
      <FieldLabel>Weight</FieldLabel>
      <InputNumber
        v-model="weight"
        :min="0"
        :step="0.5"
        :format-options="{ style: 'unit', unit: 'kilogram', minimumFractionDigits: 1 }"
        locale="en-US"
      >
        <InputNumberDecrement />
        <InputNumberInput />
        <InputNumberIncrement />
      </InputNumber>
      <FieldDescription>Half-kilogram steps.</FieldDescription>
    </Field>
    <Field>
      <FieldLabel>Share</FieldLabel>
      <InputNumber v-model="share" :min="0" :max="1" :step="0.01" :format-options="{ style: 'percent' }" locale="en-US">
        <InputNumberDecrement />
        <InputNumberInput />
        <InputNumberIncrement />
      </InputNumber>
      <FieldDescription>Stored as a fraction.</FieldDescription>
    </Field>
    <Field>
      <FieldLabel>Price</FieldLabel>
      <InputNumber
        v-model="price"
        :min="0"
        :step="50"
        :format-options="{ style: 'currency', currency: 'EUR' }"
        locale="de-DE"
      >
        <InputNumberDecrement />
        <InputNumberInput />
        <InputNumberIncrement />
      </InputNumber>
      <FieldDescription>German formatting.</FieldDescription>
    </Field>
  </div>
</template>
