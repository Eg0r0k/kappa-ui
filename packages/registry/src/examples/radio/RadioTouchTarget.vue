<script setup lang="ts">
import { Field, FieldLabel } from "@/ui/field";
import { Radio, RadioGroup } from "@/ui/radio-group";

const targets = ["none", "expand", "wrapper"] as const;
</script>

<template>
  <RadioGroup
    default-value="none"
    aria-label="Touch target"
    class="gap-2 [&_button::after]:outline [&_button::after]:outline-dashed [&_button::after]:outline-pink-500/70"
  >
    <Field v-for="target in targets" :key="target" orientation="horizontal">
      <Radio :value="target" :touch-target="target" />
      <FieldLabel class="font-mono">{{ target }}</FieldLabel>
    </Field>
  </RadioGroup>
</template>
