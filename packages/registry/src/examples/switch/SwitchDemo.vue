<script setup lang="ts">
import { Field, FieldLabel } from "@/ui/field";
import { Switch } from "@/ui/switch";
</script>

<template>
  <Field orientation="horizontal" class="w-auto">
    <Switch />
    <FieldLabel>Airplane mode</FieldLabel>
  </Field>
</template>
