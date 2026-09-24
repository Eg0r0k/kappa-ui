<script setup lang="ts">
import { Field, FieldLabel } from "@/ui/field";
import { Switch } from "@/ui/switch";

const targets = ["none", "expand", "wrapper"] as const;
</script>

<template>
  <div
    class="flex flex-col gap-2 [&_button::after]:outline [&_button::after]:outline-dashed [&_button::after]:outline-pink-500/70"
  >
    <Field v-for="target in targets" :key="target" orientation="horizontal">
      <Switch size="sm" :touch-target="target" />
      <FieldLabel class="font-mono">{{ target }}</FieldLabel>
    </Field>
  </div>
</template>
