<script setup lang="ts">
import { Field, FieldDescription, FieldLabel } from "@/ui/field";
import { InputNumber, InputNumberDecrement, InputNumberIncrement, InputNumberInput } from "@/ui/input-number";
</script>

<template>
  <div class="grid w-full max-w-md gap-6 sm:grid-cols-3">
    <Field disabled>
      <FieldLabel>Disabled</FieldLabel>
      <InputNumber :default-value="2">
        <InputNumberDecrement />
        <InputNumberInput />
        <InputNumberIncrement />
      </InputNumber>
    </Field>
    <Field>
      <FieldLabel>Read only</FieldLabel>
      <InputNumber :default-value="2" readonly>
        <InputNumberDecrement />
        <InputNumberInput />
        <InputNumberIncrement />
      </InputNumber>
      <FieldDescription>Typing and stepping are off.</FieldDescription>
    </Field>
    <Field>
      <FieldLabel>At the maximum</FieldLabel>
      <InputNumber :default-value="5" :min="0" :max="5">
        <InputNumberDecrement />
        <InputNumberInput />
        <InputNumberIncrement />
      </InputNumber>
      <FieldDescription>Only the step that stays in range is enabled.</FieldDescription>
    </Field>
  </div>
</template>
