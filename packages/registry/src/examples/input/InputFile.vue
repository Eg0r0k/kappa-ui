<script setup lang="ts">
import { Field, FieldDescription, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
</script>

<template>
  <Field class="max-w-xs">
    <FieldLabel>Avatar</FieldLabel>
    <Input type="file" accept="image/*" />
    <FieldDescription>PNG or JPG, up to 2 MB.</FieldDescription>
  </Field>
</template>
