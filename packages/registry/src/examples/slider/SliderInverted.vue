<script setup lang="ts">
import { Field, FieldLabel } from "@/ui/field";
import { Slider } from "@/ui/slider";
</script>

<template>
  <div class="flex w-full max-w-xs flex-col gap-6">
    <Field>
      <FieldLabel>Default</FieldLabel>
      <Slider :default-value="30" />
    </Field>
    <Field>
      <FieldLabel>Inverted</FieldLabel>
      <Slider :default-value="30" inverted />
    </Field>
  </div>
</template>
