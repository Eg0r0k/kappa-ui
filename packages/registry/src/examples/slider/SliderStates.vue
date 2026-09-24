<script setup lang="ts">
import { Field, FieldError, FieldLabel } from "@/ui/field";
import { Slider } from "@/ui/slider";
</script>

<template>
  <div class="flex w-full max-w-xs flex-col gap-6">
    <Field disabled>
      <FieldLabel>Disabled</FieldLabel>
      <Slider :default-value="[25, 60]" />
    </Field>
    <Field invalid>
      <FieldLabel>Invalid</FieldLabel>
      <Slider :default-value="85" />
      <FieldError errors="Keep the budget under 80%." />
    </Field>
  </div>
</template>
