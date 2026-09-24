<script setup lang="ts">
import { ref } from "vue";

import { Field, FieldDescription, FieldLabel } from "@/ui/field";
import { Slider } from "@/ui/slider";

const temperature = ref(21);
</script>

<template>
  <Field class="w-full max-w-xs">
    <div class="flex items-center justify-between">
      <FieldLabel>Temperature</FieldLabel>
      <span class="text-body-sm text-muted-foreground tabular-nums">{{ temperature.toFixed(1) }} °C</span>
    </div>
    <Slider v-model="temperature" :min="16" :max="28" :step="0.5" :aria-valuetext="`${temperature} °C`" />
    <FieldDescription>From 16 to 28 °C in steps of 0.5.</FieldDescription>
  </Field>
</template>
