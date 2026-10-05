<script setup lang="ts">
import { Checkbox } from "@/ui/checkbox";
import { Field, FieldLabel } from "@/ui/field";

const targets = ["expand", "wrapper"] as const;
const channels = ["Email", "Push", "SMS"];
</script>

<template>
  <div
    class="flex flex-wrap items-start justify-center gap-16 [&_button::after]:bg-pink-500/15 [&_button::after]:outline [&_button::after]:outline-dashed [&_button::after]:outline-pink-500/70"
  >
    <div v-for="target in targets" :key="target" class="flex flex-col gap-1">
      <span class="mb-5 font-mono text-label-md text-muted-foreground">{{ target }}</span>
      <Field v-for="channel in channels" :key="channel" orientation="horizontal">
        <Checkbox :touch-target="target" :default-value="channel === 'Email'" />
        <FieldLabel>{{ channel }}</FieldLabel>
      </Field>
    </div>
  </div>
</template>
