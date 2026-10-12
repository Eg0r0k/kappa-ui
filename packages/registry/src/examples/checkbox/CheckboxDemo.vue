<script setup lang="ts">
import { Checkbox } from "@/ui/checkbox";
import { Field, FieldLabel } from "@/ui/field";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <Field orientation="horizontal" class="w-auto">
    <Checkbox v-bind="$attrs" />
    <FieldLabel>Accept terms and conditions</FieldLabel>
  </Field>
</template>
