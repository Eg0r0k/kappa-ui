<script setup lang="ts">
import { Checkbox } from "@/ui/checkbox";
import { Field, FieldLabel } from "@/ui/field";
</script>

<template>
  <Field orientation="horizontal" class="w-auto">
    <Checkbox />
    <FieldLabel>Accept terms and conditions</FieldLabel>
  </Field>
</template>
