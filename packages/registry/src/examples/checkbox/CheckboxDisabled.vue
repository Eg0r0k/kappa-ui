<script setup lang="ts">
import { Checkbox } from "@/ui/checkbox";
import { Field, FieldLabel } from "@/ui/field";
</script>

<template>
  <div class="flex flex-col gap-3">
    <Field orientation="horizontal" disabled>
      <Checkbox />
      <FieldLabel>Sync over mobile data</FieldLabel>
    </Field>
    <Field orientation="horizontal" disabled>
      <Checkbox :default-value="true" />
      <FieldLabel>Sync over Wi-Fi</FieldLabel>
    </Field>
    <Field orientation="horizontal" disabled>
      <Checkbox default-value="indeterminate" />
      <FieldLabel>Sync some folders</FieldLabel>
    </Field>
  </div>
</template>
