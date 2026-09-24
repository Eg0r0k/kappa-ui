<script setup lang="ts">
import { Checkbox } from "@/ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/ui/field";
</script>

<template>
  <Field orientation="horizontal" class="max-w-sm">
    <Checkbox :default-value="true" />
    <FieldContent>
      <FieldLabel>Email notifications</FieldLabel>
      <FieldDescription>A summary of new comments and mentions, once a day.</FieldDescription>
    </FieldContent>
  </Field>
</template>
