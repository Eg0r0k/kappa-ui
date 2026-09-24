<script setup lang="ts">
import { Field, FieldGroup, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
</script>

<template>
  <FieldGroup class="max-w-md">
    <Field orientation="horizontal">
      <FieldLabel>Display name</FieldLabel>
      <Input default-value="Ada" class="max-w-56" />
    </Field>
    <Field orientation="horizontal">
      <FieldLabel>Time zone</FieldLabel>
      <Input default-value="Europe/London" class="max-w-56" />
    </Field>
  </FieldGroup>
</template>
