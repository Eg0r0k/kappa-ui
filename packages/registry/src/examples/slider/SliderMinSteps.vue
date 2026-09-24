<script setup lang="ts">
import { ref } from "vue";

import { Field, FieldDescription, FieldLabel } from "@/ui/field";
import { Slider } from "@/ui/slider";

const hours = ref([9, 18]);
</script>

<template>
  <Field class="w-full max-w-xs">
    <div class="flex items-center justify-between">
      <FieldLabel>Working hours</FieldLabel>
      <span class="text-body-sm text-muted-foreground tabular-nums">{{ hours[0] }}:00 – {{ hours[1] }}:00</span>
    </div>
    <Slider v-model="hours" :max="24" :min-steps-between-thumbs="4" />
    <FieldDescription>At least 4 hours apart.</FieldDescription>
  </Field>
</template>
