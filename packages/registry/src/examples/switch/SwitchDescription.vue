<script setup lang="ts">
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/ui/field";
import { Switch } from "@/ui/switch";
</script>

<template>
  <Field orientation="horizontal" class="max-w-sm">
    <FieldContent>
      <FieldLabel>Share usage data</FieldLabel>
      <FieldDescription>Anonymous crash reports and feature usage, to help us fix problems.</FieldDescription>
    </FieldContent>
    <Switch :default-value="true" />
  </Field>
</template>
