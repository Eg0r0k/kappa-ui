<script setup lang="ts">
import { Checkbox, CheckboxGroup } from "@/ui/checkbox";
import { Field, FieldLabel } from "@/ui/field";

const colors = ["primary", "neutral", "success", "warning", "destructive", "info"] as const;
</script>

<template>
  <div class="flex flex-col items-center gap-8">
    <div class="flex items-center gap-6">
      <Checkbox v-for="color in colors" :key="color" :color="color" :default-value="true" :aria-label="color" />
    </div>
    <CheckboxGroup
      color="success"
      orientation="horizontal"
      :default-value="['backups', 'updates']"
      aria-label="Automatic tasks"
    >
      <Field orientation="horizontal">
        <Checkbox value="backups" />
        <FieldLabel>Backups</FieldLabel>
      </Field>
      <Field orientation="horizontal">
        <Checkbox value="updates" color="warning" />
        <FieldLabel>Updates</FieldLabel>
      </Field>
      <Field orientation="horizontal">
        <Checkbox value="reports" />
        <FieldLabel>Reports</FieldLabel>
      </Field>
    </CheckboxGroup>
  </div>
</template>
