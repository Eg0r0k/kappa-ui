<script setup lang="ts">
import { Field, FieldLabel } from "@/ui/field";
import { Switch } from "@/ui/switch";
</script>

<template>
  <div class="flex flex-col gap-4">
    <Field orientation="horizontal" disabled>
      <Switch />
      <FieldLabel>Off</FieldLabel>
    </Field>
    <Field orientation="horizontal" disabled>
      <Switch :default-value="true" />
      <FieldLabel>On</FieldLabel>
    </Field>
  </div>
</template>
